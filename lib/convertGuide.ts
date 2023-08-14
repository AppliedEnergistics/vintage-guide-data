import { cpSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import Zopfli from "node-zopfli";
import { GuideIndex, GuideMetadataV1 } from "./targetTypes.js";
import convertNavigation from "./convertNavigation.js";
import { requireString, writeCacheBusted } from "./utils.js";
import loadPages from "./loadPages.js";
import convertItems from "./convertItems.js";
import convertPages from "./convertPages.js";
import { buildPageTree } from "./buildPageTree.js";
import convertCategoryIndex from "./convertCategoryIndex.js";
import convertItemIndex from "./convertItemIndex.js";
import convertRecipes from "./convertRecipes.js";
import convertColoredVersions from "./convertColoredVersions.js";
import semver from "semver";

function writeGuide(srcDir: string, destDir: string, gameData: any) {
  let defaultNamespace;
  const gameVersion = semver.coerce(gameData.gameVersion);
  if (!gameVersion) {
    throw new Error("Failed to coerce game version: " + gameData.gameVersion);
  }
  if (semver.lt(gameVersion, "1.18.0")) {
    defaultNamespace = "appliedenergistics2";
  } else {
    defaultNamespace = "ae2";
  }
  console.info(
    "Game version: %s. Default Namespace: %s",
    gameVersion,
    defaultNamespace,
  );

  const index: GuideIndex = {
    defaultNamespace,
    startPageId: `${defaultNamespace}:getting-started.md`,
    navigationRootNodes: [],
    coloredVersions: {},
    fluids: {},
    animations: {},
    pages: {},
    recipes: {},
    pageIndices: {},
    items: {},
  };

  const pages = loadPages(index, srcDir);
  console.info("Loaded %d pages", Object.keys(pages).length);

  const pageTree = buildPageTree(Object.values(pages));

  convertItems(gameData, index);
  convertNavigation(srcDir, index, pages);
  convertPages(pageTree, pages, index);
  convertCategoryIndex(pages, index);
  convertItemIndex(pages, index);
  convertRecipes(gameData, index);
  convertColoredVersions(gameData, index);

  const indexJson = JSON.stringify(index, null, 2);
  const indexBuffer = Buffer.from(indexJson, "utf-8");
  const gzippedIndex = Zopfli.gzipSync(indexBuffer, {});
  writeFileSync(path.join(destDir, "guide.json"), indexJson, "utf-8");
  return path.basename(
    writeCacheBusted(path.join(destDir, "guide.json.gz"), gzippedIndex),
  );
}

function writeGuideMetadata(
  gameData: any,
  destDir: string,
  guideDataPath: string,
) {
  const generated = new Date(requireString(gameData, "generated"));
  const gameVersion = requireString(gameData, "gameVersion");
  const guideIndex: GuideMetadataV1 = {
    format: 1,
    gameVersion,
    generated: generated.getTime(),
    modVersion: requireString(gameData, "modVersion"),
    guideDataPath,
  };

  writeFileSync(
    path.join(destDir, "index.json"),
    JSON.stringify(guideIndex),
    "utf-8",
  );

  return guideIndex;
}

export default function convertGuide(
  srcDir: string,
  destDir: string,
): GuideMetadataV1 {
  const gameDataPath = path.join(srcDir, "game-data.json");
  const gameData = JSON.parse(readFileSync(gameDataPath, "utf-8"));

  // Write out the guide data file and save its filename (which includes a hash)
  const guideFilename = writeGuide(srcDir, destDir, gameData);

  // Copy assets
  cpSync(path.join(srcDir, "public"), path.join(destDir), {
    recursive: true,
  });

  return writeGuideMetadata(gameData, destDir, guideFilename);
}

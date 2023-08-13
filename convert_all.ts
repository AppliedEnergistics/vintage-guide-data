import { globSync } from "glob";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import convertGuide from "./lib/convertGuide.js";
import { GuideMetadataV1 } from "./lib/targetTypes.js";

console.info("Converting guide data...");

const metadata: GuideMetadataV1[] = [];
for (const srcDir of globSync("src/*/")) {
  const destDir = "out/minecraft-" + path.basename(srcDir);
  mkdirSync(destDir, { recursive: true });

  console.info("Converting %s -> %s", srcDir, destDir);
  metadata.push(convertGuide(srcDir, destDir));
}

const consolidatedIndex = {
  versions: metadata.map((guideMeta) => ({
    format: guideMeta.format,
    generated: guideMeta.generated,
    gameVersion: guideMeta.gameVersion,
    modVersion: guideMeta.modVersion,
    url: "./minecraft-" + guideMeta.gameVersion + "/index.json",
  })),
};

mkdirSync("out", { recursive: true });
writeFileSync(
  "out/index.json",
  JSON.stringify(consolidatedIndex, null, 2),
  "utf-8",
);

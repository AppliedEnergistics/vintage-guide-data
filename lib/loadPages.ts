import { globSync } from "glob";
import { readFileSync } from "fs";
import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { gfm } from "micromark-extension-gfm";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { mdx } from "micromark-extension-mdx";
import { Root } from "mdast";
import path from "path";
import { frontmatter } from "micromark-extension-frontmatter";
import YAML from "yaml";
import { pagePathToId, qualifyId } from "./utils.js";

export type LoadedPage = {
  /**
   * Page ID in the new format.
   */
  id: string;
  path: string;
  frontmatter: Record<string, any>;
  root: Root;

  // Info from frontmatter
  title: string;
  categories: string[];
  itemIds: string[];
  sidenavIcon: string | undefined;
};

function extractFrontmatter(root: Root) {
  // YAML node must come first
  let frontmatterDict: Record<string, any> = {};
  if (root.children[0]?.type === "yaml") {
    const yamlNode = root.children[0];
    root.children.splice(0, 1);

    const yamlRoot = YAML.parse(yamlNode.value);
    if (typeof yamlRoot !== "object" || yamlRoot === null) {
      console.error("Markdown page %s has invalid frontmatter: %o", yamlRoot);
    } else {
      frontmatterDict = yamlRoot;
    }
  }
  return frontmatterDict;
}

function loadPage(pagePath: string, pageContent: string): LoadedPage {
  const root = fromMarkdown(pageContent, {
    extensions: [frontmatter(["yaml"]), gfm(), mdx()],
    mdastExtensions: [
      frontmatterFromMarkdown(["yaml"]),
      gfmFromMarkdown(),
      mdxFromMarkdown(),
    ],
  });

  const frontmatterDict = extractFrontmatter(root);

  let {
    sidenav_icon: sidenavIcon,
    item_ids: itemIds,
    title,
    categories,
  } = frontmatterDict;
  // For export purposes, we only keep frontmatter that is not known
  delete frontmatterDict["sidenav_icon"];
  delete frontmatterDict["item_ids"];
  delete frontmatterDict["title"];
  delete frontmatterDict["categories"];
  itemIds ??= [];
  itemIds = itemIds.map(qualifyId);
  categories ??= [];
  sidenavIcon ??= itemIds[0];
  sidenavIcon = qualifyId(sidenavIcon);

  return {
    id: pagePathToId(pagePath),
    path: pagePath,
    frontmatter: frontmatterDict,
    root,

    title,
    categories,
    itemIds,
    sidenavIcon,
  };
}

export default function loadPages(srcDir: string): Record<string, LoadedPage> {
  const pages: Record<string, LoadedPage> = {};
  const contentRoot = path.join(srcDir, "content");
  for (const pagePath of globSync("**/*.md", { cwd: contentRoot })) {
    const pageContent = readFileSync(path.join(contentRoot, pagePath), "utf-8");
    const page = loadPage(pagePath, pageContent);
    pages[page.id] = page;
  }
  return pages;
}

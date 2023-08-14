import { GuideIndex, NavigationNode } from "./targetTypes.js";
import { LoadedPage } from "./loadPages.js";
import { readFileSync } from "fs";
import path from "path";
import { pagePathToId } from "./utils.js";

interface PageLink {
  title: string;
  path: string;
}

interface MenuEntry {
  header: string;
  children: (string | PageLink)[];
}

function convertMenuEntryToNavigationNode(
  index: GuideIndex,
  entry: string | PageLink,
  pages: Record<string, LoadedPage>,
): NavigationNode {
  const pagePath = typeof entry === "string" ? entry : entry.path;
  const pageId = pagePathToId(index, pagePath);
  const page = pages[pageId];
  if (!page) {
    throw new Error("Menu contains unknown page: " + pagePath);
  }
  const title = typeof entry === "string" ? page.title : entry.title;

  return {
    title,
    pageId: page.id,
    position: 0,
    hasPage: true,
    icon: page.sidenavIcon,
    children: [],
  };
}

export default function convertNavigation(
  srcDir: string,
  guideIndex: GuideIndex,
  pages: Record<string, LoadedPage>,
) {
  // The sidebar navigation in older guides was hardcoded in the website itself
  const menuEntries: MenuEntry[] = JSON.parse(
    readFileSync(path.join(srcDir, "sidenav.json"), "utf-8"),
  );

  for (const menuEntry of menuEntries) {
    guideIndex.navigationRootNodes.push({
      title: menuEntry.header,
      hasPage: false,
      pageId: "",
      icon: undefined,
      position: 0,
      children: menuEntry.children.map((entry) =>
        convertMenuEntryToNavigationNode(guideIndex, entry, pages),
      ),
    });
  }
}

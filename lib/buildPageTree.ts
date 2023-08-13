/*
 * Creates an index of all pages.
 */

import { LoadedPage } from "./loadPages.js";

export interface CategoryNode {
  title: string;
  fullPath: string;
  level: number;
  pages: LoadedPage[];
  categories: CategoryNode[];
}

export interface PageTree {
  rootCategories: CategoryNode[];
  pages: LoadedPage[];
}

function findOrCreateCategory(
  start: CategoryNode[],
  category: string,
): CategoryNode {
  let level = 0;
  let node: CategoryNode | undefined = undefined;
  let subNodes: CategoryNode[] = start;
  const fullPath: string[] = [];

  for (const title of category.split("/")) {
    node = subNodes.find((c) => c.title === title);
    fullPath.push(title);
    if (!node) {
      node = {
        title,
        fullPath: fullPath.join("/"),
        level,
        categories: [],
        pages: [],
      };
      subNodes.push(node);
      subNodes.sort((a, b) => a.title.localeCompare(b.title));
    }

    subNodes = node.categories;
    level++;
  }

  if (!node) {
    throw new Error("Empty category found");
  }
  return node;
}

/**
 * Find a category by full title.
 */
export function findCategory(pageTree: PageTree, name: string): CategoryNode {
  let nextLevel = pageTree.rootCategories;
  let category: CategoryNode | undefined;
  for (const part of name.split("/")) {
    category = nextLevel.find((c) => c.title === part);
    if (!category) {
      break;
    }
    nextLevel = category.categories;
  }

  if (!category) {
    throw new Error("Couldn't find category: " + name);
  }

  return category;
}

export function buildPageTree(allPages: LoadedPage[]): PageTree {
  const tree: PageTree = {
    rootCategories: [],
    pages: [],
  };

  for (const page of allPages) {
    tree.pages.push(page);

    for (const categoryPath of page.categories) {
      const category = findOrCreateCategory(tree.rootCategories, categoryPath);
      category.pages.push(page);
      category.pages.sort((a, b) => a.title.localeCompare(b.title));
    }
  }

  return tree;
}

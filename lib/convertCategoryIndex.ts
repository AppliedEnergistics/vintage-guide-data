import { GuideIndex } from "./targetTypes.js";
import { LoadedPage } from "./loadPages.js";

export default function convertCategoryIndex(
  pages: Record<string, LoadedPage>,
  index: GuideIndex,
) {
  const categoryToPages = new Map<string, LoadedPage[]>();

  for (const page of Object.values(pages)) {
    for (const categoryPath of page.categories) {
      let pagesInCategory = categoryToPages.get(categoryPath);
      if (!pagesInCategory) {
        pagesInCategory = [];
        categoryToPages.set(categoryPath, pagesInCategory);
      }
      pagesInCategory.push(page);
    }
  }

  // Sort each category by page-title
  for (let pagesInCategory of categoryToPages.values()) {
    pagesInCategory.sort((a, b) => a.title.localeCompare(b.title));
  }

  // Collect it into the index format
  index.pageIndices["appeng.client.guidebook.indices.CategoryIndex"] = [
    ...categoryToPages.entries(),
  ].flatMap(([categoryName, pagesInCategory]) => [
    categoryName,
    pagesInCategory.map((page) => page.id),
  ]);
}

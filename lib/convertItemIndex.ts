import { GuideIndex } from "./targetTypes.js";
import { LoadedPage } from "./loadPages.js";
import { qualifyId } from "./utils.js";

export default function convertItemIndex(
  pages: Record<string, LoadedPage>,
  index: GuideIndex,
) {
  const itemIdToPage = new Map<string, string>();

  for (const page of Object.values(pages)) {
    for (let itemId of page.itemIds) {
      itemId = qualifyId(itemId);

      const existingPageId = itemIdToPage.get(itemId);
      if (existingPageId) {
        // Stupid heuristic: Position of this item-id in the lists of item-ids on both pages
        const ourPos = page.itemIds.indexOf(itemId);
        const theirPos = pages[existingPageId].itemIds.indexOf(itemId);
        if (ourPos < theirPos) {
          console.warn(
            "Multiple pages for item %s. %s takes priority over %s.",
            itemId,
            page.id,
            itemIdToPage.get(itemId),
          );
          itemIdToPage.set(itemId, page.id);
        } else {
          console.warn(
            "Multiple pages for item %s. %s takes priority over %s.",
            itemId,
            itemIdToPage.get(itemId),
            page.id,
          );
        }
      } else {
        itemIdToPage.set(itemId, page.id);
      }
    }
  }

  // Collect it into the index format
  index.pageIndices["appeng.client.guidebook.indices.ItemIndex"] = [
    ...itemIdToPage.entries(),
  ].flatMap(([categoryName, pageId]) => [categoryName, pageId]);
}

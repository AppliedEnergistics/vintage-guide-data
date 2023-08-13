import { GuideIndex } from "./targetTypes.js";

const validRarity = ["common", "uncommon", "rare", "epic"];
export type Rarity = "common" | "uncommon" | "rare" | "epic";

export interface OldItemInfo {
  id: string;
  displayName: string;
  rarity: Rarity;
  icon: string;
}

export default function convertItems(gameData: any, guideIndex: GuideIndex) {
  const oldItemIndex = Object.entries(
    gameData.items as Record<string, OldItemInfo>,
  );
  for (const [itemId, itemInfo] of oldItemIndex) {
    guideIndex.items[itemId] = itemInfo;
  }
}

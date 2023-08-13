import { GuideIndex } from "./targetTypes.js";

export default function convertColoredVersions(
  gameData: any,
  index: GuideIndex,
) {
  for (const [uncoloredItemId, coloredVariants] of Object.entries(
    gameData.coloredVersions,
  )) {
    index.coloredVersions[uncoloredItemId] = coloredVariants as any;
  }
}

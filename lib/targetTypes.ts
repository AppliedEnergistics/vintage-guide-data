import { Root as MdAstRoot } from "mdast";

// ************************************************************************************************************
// THIS FILE CONTAINS TYPES FROM THE NEW GUIDE REACT SITE
// https://github.com/AppliedEnergistics/guide
// ************************************************************************************************************

// Structure for the content of the index.json file found in a specific version of the guide
export type GuideMetadataV1 = {
  format: 1;
  gameVersion: string;
  modVersion: string;
  generated: number;
  guideDataPath: string;
};

export enum RecipeType {
  CraftingRecipeType = "minecraft:crafting",
  SmeltingRecipeType = "minecraft:smelting",
  StonecuttingRecipeType = "minecraft:stonecutting",
  SmithingRecipeType = "minecraft:smithing",
  TransformRecipeType = "ae2:transform",
  InscriberRecipeType = "ae2:inscriber",
  ChargerRecipeType = "ae2:charger",
  EntropyRecipeType = "ae2:entropy",
  MatterCannonAmmoType = "ae2:matter_cannon",
}

export interface RecipeInfo<T extends RecipeType> {
  type: T;
  id: string;
  resultItem: string;
  resultCount: number;
}

export interface CraftingRecipeInfo
  extends RecipeInfo<typeof RecipeType.CraftingRecipeType> {
  shapeless: boolean;
  ingredients: string[][];
  width: number;
  height: number;
}

export interface SmeltingRecipeInfo
  extends RecipeInfo<typeof RecipeType.SmeltingRecipeType> {
  ingredient: string[];
}

export interface SmithingRecipeInfo
  extends RecipeInfo<typeof RecipeType.SmithingRecipeType> {
  base: string[];
  addition: string[];
  template: string[];
}

export interface StonecuttingRecipeInfo
  extends RecipeInfo<typeof RecipeType.StonecuttingRecipeType> {
  ingredient: string[];
}

export interface InscriberRecipeInfo
  extends RecipeInfo<typeof RecipeType.InscriberRecipeType> {
  top: string[];
  middle: string[];
  bottom: string[];
  consumesTopAndBottom: boolean;
}

export type TransformCircumstanceInfo =
  | { type: "explosion" }
  | TransformInFluidCircumstanceInfo;

export interface TransformInFluidCircumstanceInfo {
  type: "fluid";
  // IDs of fluids
  fluids: string[];
}

export interface TransformRecipeInfo
  extends RecipeInfo<typeof RecipeType.TransformRecipeType> {
  ingredients: string[][];
  resultItem: string;
  circumstance: TransformCircumstanceInfo;
}

export interface EntropyRecipeInfo
  extends RecipeInfo<typeof RecipeType.EntropyRecipeType> {}

export interface ChargerRecipeInfo
  extends RecipeInfo<typeof RecipeType.ChargerRecipeType> {
  ingredient: string[];
}

export interface MatterCannonAmmoInfo
  extends RecipeInfo<typeof RecipeType.MatterCannonAmmoType> {}

export type TaggedRecipe =
  | CraftingRecipeInfo
  | SmithingRecipeInfo
  | SmeltingRecipeInfo
  | StonecuttingRecipeInfo
  | InscriberRecipeInfo
  | TransformRecipeInfo
  | EntropyRecipeInfo
  | ChargerRecipeInfo
  | MatterCannonAmmoInfo;

export type Rarity = "common" | "uncommon" | "rare" | "epic";

export interface ItemInfo {
  id: string;
  displayName: string;
  rarity: Rarity;
  icon: string;
}

export interface FluidInfo {
  id: string;
  displayName: string;
  icon: string;
}

export interface P2PTypeInfo {
  tunnelItemId: string;

  attunementItemIds: string[];
  attunementApiClasses: string[];
}

export type ExportedPage = {
  title: string;
  astRoot: MdAstRoot;
  frontmatter: Record<string, unknown>;
};

export type AnimationInfo = {
  frameWidth: number;
  frameHeight: number;
  length: number;
  frameCount: number;
  keyFrames: AnimationFrame[];
};

export type AnimationFrame = {
  index: number;
  frameX: number;
  frameY: number;
};

export type DyeColor =
  | "yellow"
  | "blue"
  | "orange"
  | "gray"
  | "purple"
  | "magenta"
  | "lime"
  | "white"
  | "pink"
  | "light_blue"
  | "light_gray"
  | "red"
  | "green"
  | "black"
  | "cyan"
  | "brown";

export type GuideIndex = {
  defaultNamespace: string;
  pages: Record<string, ExportedPage>;
  navigationRootNodes: NavigationNode[];

  startPageId?: string;

  items: Record<string, ItemInfo>;
  fluids: Record<string, FluidInfo>;

  recipes: Record<string, TaggedRecipe>;

  coloredVersions: Record<string, Record<DyeColor, string>>;

  pageIndices: Record<string, Array<any>>;

  animations: Record<string, AnimationInfo>;
};

export type NavigationNode = {
  pageId: string;
  title: string;
  icon?: string;
  children: NavigationNode[];
  position: number;
  hasPage: boolean;
};

// Map item id -> page id
export type ItemIndex = Map<string, string>;
export type CategoryIndex = Map<string, string[]>;

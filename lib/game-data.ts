export interface Recipe {
  id: string;
  resultItem: string;
  resultCount: number;
}

export interface CraftingRecipe extends Recipe {
  shapeless: boolean;
  ingredients: string[][];
  width: number;
  height: number;
}

export interface SmeltingRecipe extends Recipe {
  ingredient: string[];
}

export interface InscriberRecipe extends Recipe {
  top: string[];
  middle: string[];
  bottom: string[];
  consumesTopAndBottom: boolean;
}

export interface P2PTypeInfo {
  tunnelItemId: string;

  attunementItemIds: string[];
  attunementApiClasses: string[];
}

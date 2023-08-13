import {
  CraftingRecipeInfo,
  GuideIndex,
  InscriberRecipeInfo,
  RecipeType,
  SmeltingRecipeInfo,
} from "./targetTypes.js";
import {
  CraftingRecipe,
  InscriberRecipe,
  SmeltingRecipe,
} from "./game-data.js";

function convertSmeltingRecipe(recipe: SmeltingRecipe): SmeltingRecipeInfo {
  return {
    type: RecipeType.SmeltingRecipeType,
    ...recipe,
  };
}

function convertCraftingRecipe(recipe: CraftingRecipe): CraftingRecipeInfo {
  return {
    type: RecipeType.CraftingRecipeType,
    ...recipe,
  };
}

function convertInscriberRecipe(recipe: InscriberRecipe): InscriberRecipeInfo {
  return {
    type: RecipeType.InscriberRecipeType,
    ...recipe,
  };
}

export default function convertRecipes(gameData: any, index: GuideIndex) {
  for (let [recipeId, recipe] of Object.entries(gameData.smeltingRecipes)) {
    index.recipes[recipeId] = convertSmeltingRecipe(recipe as SmeltingRecipe);
  }
  for (let [recipeId, recipe] of Object.entries(gameData.craftingRecipes)) {
    index.recipes[recipeId] = convertCraftingRecipe(recipe as CraftingRecipe);
  }
  for (let [recipeId, recipe] of Object.entries(gameData.inscriberRecipes)) {
    index.recipes[recipeId] = convertInscriberRecipe(recipe as InscriberRecipe);
  }
}

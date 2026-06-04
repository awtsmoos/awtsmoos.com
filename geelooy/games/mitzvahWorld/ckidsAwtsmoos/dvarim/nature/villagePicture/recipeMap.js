// B"H
/**
 * @file recipeMap.js
 * @description
 * Chapter 378: The recipe map cache is torn open so roof edits reach houses.
 */
import { gableHouse } from "./cottageRecipe.js?v=roof-recipe-live-20260603-bh378";
import { pergolaPortal, lantern } from "./portalRecipes.js";
import { bench, cobbleRoad, fence, flowerPatch, rock, rockField, steps, terrace, well } from "./landscapeRecipes.js";
import { meadowDetail } from "./fieldRecipes.js";
import { pictureDirtPath } from "./pathRecipe.js";
import { pictureStoneSteps, pictureTerraceWall } from "./terraceRecipe.js";
import { pictureAnchorTree } from "./treeRecipe.js";

export const VILLAGE_PICTURE_RECIPES = Object.freeze({
  bench,
  cobbleRoad,
  fence,
  flowerPatch,
  gableHouse,
  lantern,
  meadowDetail,
  pergolaPortal,
  pictureAnchorTree,
  pictureDirtPath,
  pictureStoneSteps,
  pictureTerraceWall,
  rock,
  rockField,
  steps,
  terrace,
  well
});

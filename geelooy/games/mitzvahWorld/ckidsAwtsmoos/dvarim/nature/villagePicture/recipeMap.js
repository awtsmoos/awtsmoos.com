// B"H
/**
 * @file recipeMap.js
 * @description
 * Chapter 105: The recipe map chooses the stable upgraded village recipes.
 * We keep the old picture-prop architecture, but route trees and paths through
 * fresh grounded, textured, mobile-safe versions.
 */
import { gableHouse } from "./cottageRecipe.js?v=warm-cottage-details-20260604-bh426";
import { pergolaPortal, lantern } from "./portalRecipes.js";
import { bench, cobbleRoad, fence, flowerPatch, rock, rockField, steps, terrace, well } from "./landscapeRecipes.js";
import { meadowDetail } from "./fieldRecipes.js";
import { pictureDirtPath } from "./pathRecipe.js?v=rich-grounded-road-20260604-bh441";
import { pictureStoneSteps, pictureTerraceWall } from "./terraceRecipe.js";
import { pictureAnchorTree } from "./treeRecipe.js?v=layered-grounded-tree-20260604-bh441";

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

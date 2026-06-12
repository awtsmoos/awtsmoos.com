// B"H
/**
 * @file recipeMap.js
 * @description
 * Chapter 133: The recipe map points at the sane tree.
 * The old layered tree cache produced a spike-broom. The map now imports the
 * soft readable canopy version, while keeping stable house/path recipes.
 */
import { gableHouse } from "./cottageRecipe.js?v=warm-cottage-details-20260604-bh426";
import { pergolaPortal, lantern } from "./portalRecipes.js";
import { bench, cobbleRoad, fence, flowerPatch, rock, rockField, steps, terrace, well } from "./landscapeRecipes.js";
import { meadowDetail } from "./fieldRecipes.js?v=village-polish-20260612-bh810";
import { pictureDirtPath } from "./pathRecipe.js?v=rich-grounded-road-20260604-bh441";
import { pictureStoneSteps, pictureTerraceWall } from "./terraceRecipe.js";
import { pictureAnchorTree } from "./treeRecipe.js?v=village-polish-20260612-bh810";

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

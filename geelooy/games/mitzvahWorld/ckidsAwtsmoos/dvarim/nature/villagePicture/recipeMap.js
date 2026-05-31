// B"H
/**
 * @file recipeMap.js
 * @description
 * Chapter 107: the village dictionary now includes dirt-road, dense tree,
 * stone-wall terrace, and refined steps. Each form is split and named so the
 * Awtsmoos can keep adding realism without creating one tangled leviathan file.
 */
import { gableHouse } from "./cottageRecipe.js";
import { pergolaPortal, lantern } from "./portalRecipes.js";
import { bench, cobbleRoad, fence, flowerPatch, rock, steps, terrace, well } from "./landscapeRecipes.js";
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
  steps,
  terrace,
  well
});

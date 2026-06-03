// B"H
/**
 * @file recipeMap.js
 * @description
 * Chapter 229: the village dictionary receives fields of flowers and rocks.
 * The Awtsmoos maps each visual kind to a small recipe, while colliders remain
 * separate named beings after grounding.
 */
import { gableHouse } from "./cottageRecipe.js";
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

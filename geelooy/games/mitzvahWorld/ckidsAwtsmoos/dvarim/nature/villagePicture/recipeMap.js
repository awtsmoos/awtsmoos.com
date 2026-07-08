// B"H
/** @file recipeMap.js @description Recipe map with bitmap tree and hardened visible house. */
import { gableHouse } from "./cottageRecipe.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { pergolaPortal, lantern } from "./portalRecipes.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { bench, cobbleRoad, fence, flowerPatch, rock, rockField, steps, terrace, well } from "./landscapeRecipes.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { meadowDetail } from "./fieldRecipes.js?compact=true&v=village-polish-20260612-bh810";
import { pictureDirtPath } from "./pathRecipe.js?compact=true&v=rich-grounded-road-20260604-bh441";
import { pictureStoneSteps, pictureTerraceWall } from "./terraceRecipe.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { pictureAnchorTree } from "./treeRecipe.js?compact=true&v=fps-door-target-idle-20260708-bh1";
export const VILLAGE_PICTURE_RECIPES=Object.freeze({bench,cobbleRoad,fence,flowerPatch,gableHouse,lantern,meadowDetail,pergolaPortal,pictureAnchorTree,pictureDirtPath,pictureStoneSteps,pictureTerraceWall,rock,rockField,steps,terrace,well});

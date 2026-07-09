// B"H
/** @file recipeMap.js @description Cache-busted recipe map for restored cottage and fast visible tree presets. */
import { gableHouse } from "./cottageRecipe.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { pergolaPortal, lantern } from "./portalRecipes.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { bench, cobbleRoad, fence, flowerPatch, rock, rockField, steps, terrace, well } from "./landscapeRecipes.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { meadowDetail } from "./fieldRecipes.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { pictureDirtPath } from "./pathRecipe.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { pictureStoneSteps, pictureTerraceWall } from "./terraceRecipe.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { pictureAnchorTree } from "./treeRecipe.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
export const VILLAGE_PICTURE_RECIPES=Object.freeze({bench,cobbleRoad,fence,flowerPatch,gableHouse,lantern,meadowDetail,pergolaPortal,pictureAnchorTree,pictureDirtPath,pictureStoneSteps,pictureTerraceWall,rock,rockField,steps,terrace,well});

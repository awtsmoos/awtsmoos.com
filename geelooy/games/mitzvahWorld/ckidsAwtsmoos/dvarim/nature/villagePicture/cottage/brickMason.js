// B"H
/**
 * @file brickMason.js
 * @description
 * Chapter 222: The old cottage mason becomes a doorway to the general mason.
 * Kept as a compatibility re-export so existing cottage code and future village
 * objects both drink from the same Awtsmoos brick algorithm.
 */
export {
  DEFAULT_STONE_PALETTE as STONE_PALETTE,
  addMasonryBox as cube,
  buildBrickSpan,
  buildBrickStructure
} from "../masonry/brickStructure.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

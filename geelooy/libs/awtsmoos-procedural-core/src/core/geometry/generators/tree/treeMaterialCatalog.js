// B"H
/** @file treeMaterialCatalog.js @description Semantic bark and leaf types still needing custom procedural generation. */
export const TREE_BARK_TYPE_ALIASES = Object.freeze({
  Bark001:"bark_oak", Bark002:"bark_aspen", Bark003:"bark_pine", oak:"bark_oak", birch:"bark_birch", pine:"bark_pine"
});
export const TREE_LEAF_TYPE_ALIASES = Object.freeze({
  oak:"leaf_oak", ash:"leaf_ash", aspen:"leaf_aspen", pine:"leaf_pine", leaf:"leaf"
});
export const REQUIRED_TREE_BARK_TYPES = Object.freeze([
  "bark_oak","bark_ash","bark_aspen","bark_birch","bark_pine","bark_willow","bark_cedar",
  "bark_cypress","bark_palm","bark_baobab","bark_acacia","bark_apple","bark_redwood",
  "bark_olive","bark_poplar","bark_mangrove","bark_maple","bark_dead"
]);
export const REQUIRED_TREE_LEAF_TYPES = Object.freeze([
  "leaf_oak","leaf_ash","leaf_aspen","leaf_birch","leaf_pine","leaf_willow","leaf_maple",
  "leaf_olive","leaf_palm_frond","leaf_cedar_spray","leaf_cypress_scale","leaf_acacia_pinnate",
  "leaf_apple","leaf_baobab","leaf_redwood_needle","leaf_poplar","leaf_mangrove","leaf_sakura"
]);
export const TREE_MATERIAL_NEEDS = Object.freeze({
  bark:Array.from(REQUIRED_TREE_BARK_TYPES),
  leaves:Array.from(REQUIRED_TREE_LEAF_TYPES),
  note:"Custom-generate these semantic bark/leaf textures; do not depend on ez-tree assets."
});
export function canonicalBarkType(type){return TREE_BARK_TYPE_ALIASES[type] || type || "bark_oak";}
export function canonicalLeafType(type){return TREE_LEAF_TYPE_ALIASES[type] || type || "leaf_oak";}

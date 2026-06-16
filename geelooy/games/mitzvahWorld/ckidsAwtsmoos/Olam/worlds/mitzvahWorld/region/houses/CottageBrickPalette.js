// B"H
/** @file CottageBrickPalette.js @description Cottage material truth: bricks, mortar, beams, shingles, doors, and interior woods. */
export const COTTAGE_BRICK_PALETTE = Object.freeze({
  foundation:{ color:0x7b6b58, size:[.42,.16,.22], jitter:.035, name:"fieldstone_foundation" },
  wall:{ color:0xc48752, alt:0xae6e43, size:[.36,.14,.18], jitter:.028, name:"warm_clay_brick" },
  mortar:{ color:0xd8c6a3, thickness:.018, name:"lime_mortar" },
  corner:{ color:0x9d7a56, size:[.46,.18,.24], jitter:.018, name:"corner_stone" },
  beam:{ color:0x5a351d, size:[.22,.22,.22], name:"dark_oak_beam" },
  roof:{ color:0x7a2f25, alt:0x9a4834, size:[.38,.055,.28], name:"red_shingle" },
  door:{ color:0x5b2f18, trim:0x2a170e, metal:0xcaa75c, name:"plank_door" },
  window:{ frame:0x4f2b18, glass:0x233f57, sill:0xb9a071, name:"small_window" },
  floor:{ color:0x7e5634, name:"wood_floor" },
  plaster:{ color:0xe2d1aa, name:"lime_plaster_patch" }
});
export function cottagePalette() { return COTTAGE_BRICK_PALETTE; }
export function cottageColor(key, fallback = 0xffffff) { const value = COTTAGE_BRICK_PALETTE[key]; return value?.color ?? value?.frame ?? fallback; }
export default COTTAGE_BRICK_PALETTE;

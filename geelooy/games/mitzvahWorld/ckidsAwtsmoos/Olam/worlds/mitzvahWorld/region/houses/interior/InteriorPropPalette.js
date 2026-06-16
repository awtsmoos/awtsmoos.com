// B"H
/** @file InteriorPropPalette.js @description Semantic cottage interior prop palette. */
export const INTERIOR_PROPS = Object.freeze({
  bed:{ size:[1.3,.32,.72], color:0x7d5331, socket:"bed" }, table:{ size:[.75,.42,.75], color:0x6d4324, socket:"table" }, lamp:{ size:[.18,.72,.18], color:0xd6b04a, socket:"lamp" }, chest:{ size:[.74,.42,.42], color:0x5a321d, socket:"storage" }, shelf:{ size:[.92,.86,.18], color:0x6b4326, socket:"storage" }, hearth:{ size:[.72,.72,.32], color:0x6a3a25, socket:"hearth" }, anvil:{ size:[.58,.38,.32], color:0x4a4a4a, socket:"profession" }, oven:{ size:[.78,.68,.5], color:0x8a5d3a, socket:"hearth" }, desk:{ size:[.82,.48,.52], color:0x6e4328, socket:"profession" }, herb_rack:{ size:[.5,.78,.18], color:0x507a38, socket:"profession" }, loom:{ size:[.82,.86,.2], color:0x7b553a, socket:"profession" }
});
export function propSpec(kind = "chest") { return INTERIOR_PROPS[kind] || { size:[.42,.42,.42], color:0x806040, socket:"profession" }; }
export default INTERIOR_PROPS;

// B"H
/** @file HouseInteriorSpawner.js @description Structured cottage interiors instead of bare prop strings. */
export const PROFESSION_INTERIORS = Object.freeze({
  blacksmith:["anvil","forge","tongs","coal_bin"], baker:["oven","flour_sack","kneading_table"], scribe:["desk","scrolls","ink_stand"], tailor:["loom","cloth_bolt","needle_box"], healer:["herb_shelf","cot","water_jug"], farmer:["seed_crate","hoe","grain_sack"]
});
function socket(kind, x, z, y = .18) { return { kind, x, z, y, visible:true, cottageInteriorProp:true }; }
export function interiorFor(profession = "home") { const base = [socket("bed", -1.45, -1.05), socket("table", .55, -.45), socket("lamp", .55, -.45, .48), socket("chest", -1.35, 1.05), socket("shelf", 1.45, 1.05, .44)]; const extras = PROFESSION_INTERIORS[profession] || []; extras.forEach((kind, i) => base.push(socket(kind, .9 + (i % 2) * .55, .45 + Math.floor(i / 2) * .55))); return base; }
export default interiorFor;

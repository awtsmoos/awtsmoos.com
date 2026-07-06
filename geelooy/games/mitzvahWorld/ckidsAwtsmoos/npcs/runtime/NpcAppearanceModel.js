// B"H
/** @file NpcAppearanceModel.js @description Visual NPC vessels from hair to yarmulka, ready for model binding. */
const COLORS = ["black","brown","blond","gray","white","auburn"];
function pick(list, seed = 0) { return list[Math.abs(seed) % list.length]; }
export function npcAppearance(seed = 1, overrides = {}) { return { hair:pick(COLORS, seed), beard:seed % 2 ? "short" : "full", hat:seed % 3 ? "black-hat" : "cap", coat:seed % 2 ? "long-coat" : "jacket", shirt:"white", pants:"dark", shoes:"black", yarmulka:"velvet", glasses:seed % 5 === 0, colors:{ accent:pick(COLORS, seed + 2) }, ...overrides }; }
export default npcAppearance;

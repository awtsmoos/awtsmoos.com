// B"H
/**
 * @file InstancePool.js
 * @description Ecology cells become bounded visual instance plans with parser-clear spawn law.
 */
const LIMITS = Object.freeze({ grass:7200, flowers:2200, trees:320, rocks:240, reeds:760, mushrooms:360, debris:520 });
function cellsOf(ecology) { return ecology && Array.isArray(ecology.cells) ? ecology.cells : []; }
function spawnOf(cell) { return cell && cell.spawn ? cell.spawn : {}; }
function emptyPlan() { return { grass:[], flowers:[], trees:[], rocks:[], reeds:[], mushrooms:[], debris:[] }; }
function can(list, key) { return list.length < LIMITS[key]; }
function pick(i, rate) { return rate <= 1 || i % rate === 0; }
function jitter(i, salt) { return (((i * 1103515245 + salt * 12345) >>> 0) % 1000) / 1000 - .5; }
function spec(cell, i, kind) { return { kind, biome:cell.biome, x:cell.x + jitter(i,1) * 6, z:cell.z + jitter(i,2) * 6, scale:.7 + Math.abs(jitter(i,3)) }; }
function treeKind(cell) { if (cell.biome === "orchardRing") return "apple"; if (cell.moisture > .65) return "willow"; if (cell.altitude > .55) return "pine"; return pick(Math.floor(cell.x), 2) ? "oak" : "birch"; }
function flowerKind(cell) { if (cell.moisture > .65) return "lavender"; if (cell.traffic > .25) return "clover"; return pick(Math.floor(cell.x + cell.z), 2) ? "daisy" : "wildflower"; }
function treeRate(cell) { return cell.biome === "ancientGrove" ? 3 : cell.biome === "forestBelt" ? 5 : 8; }
function treeSpec(cell, i) { const base = spec(cell, i, treeKind(cell)); base.age = cell.biome === "ancientGrove" ? "ancient" : pick(i,4) ? "adult" : "young"; return base; }
function emitCell(out, cell, i) {
  const spawn = spawnOf(cell);
  if (spawn.grass && can(out.grass, "grass") && pick(i, 2 + Math.floor(cell.fertility * 5))) out.grass.push(spec(cell, i, "grass"));
  if (spawn.flowers && can(out.flowers, "flowers") && pick(i, 7)) out.flowers.push(spec(cell, i, flowerKind(cell)));
  if (spawn.trees && can(out.trees, "trees") && pick(i, treeRate(cell))) out.trees.push(treeSpec(cell, i));
  if (spawn.rocks && can(out.rocks, "rocks") && pick(i, 5)) out.rocks.push(spec(cell, i, "rock"));
  if (spawn.reeds && can(out.reeds, "reeds") && pick(i, 2)) out.reeds.push(spec(cell, i, "reed"));
  if (spawn.mushrooms && can(out.mushrooms, "mushrooms") && pick(i, 9)) out.mushrooms.push(spec(cell, i, "mushroom"));
  if (can(out.debris, "debris") && cell.traffic < .45 && pick(i, 11)) out.debris.push(spec(cell, i, "fallenLeaf"));
}
function summarize(out) { const summary = {}; for (const key of Object.keys(out)) if (Array.isArray(out[key])) summary[key] = out[key].length; summary.total = Object.values(summary).reduce((a,b)=>a+b,0); return summary; }
export function buildInstancePlan({ ecology = {} } = {}) { const out = emptyPlan(); const cells = cellsOf(ecology); for (let i=0; i<cells.length; i++) emitCell(out, cells[i], i); out.summary = summarize(out); out.version = "instance-plan-v3-parser-clear-ecology-driven"; return out; }

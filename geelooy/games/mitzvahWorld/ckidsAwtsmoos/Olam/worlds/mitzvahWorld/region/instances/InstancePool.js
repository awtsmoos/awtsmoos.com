// B"H
/**
 * @file InstancePool.js
 * @description Chapter 985: visual density now sprouts from ecology cells.
 */
const LIMITS = Object.freeze({ grass: 7200, flowers: 2200, trees: 320, rocks: 240, reeds: 760, mushrooms: 360, debris: 520 });

export function buildInstancePlan({ ecology = {} } = {}) {
  const out = emptyPlan();
  const cells = ecology.cells || [];
  for (let i = 0; i < cells.length; i += 1) emitCell(out, cells[i], i);
  out.summary = Object.fromEntries(Object.entries(out).filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, v.length]));
  out.summary.total = Object.values(out.summary).reduce((a, b) => a + b, 0);
  out.version = "instance-plan-v2-ecology-driven";
  return out;
}

function emptyPlan() { return { grass: [], flowers: [], trees: [], rocks: [], reeds: [], mushrooms: [], debris: [] }; }
function emitCell(out, c, i) {
  if (c.spawn?.grass && can(out.grass, "grass") && pick(i, 2 + Math.floor(c.fertility * 5))) out.grass.push(spec(c, i, "grass"));
  if (c.spawn?.flowers && can(out.flowers, "flowers") && pick(i, 7)) out.flowers.push(spec(c, i, flowerKind(c)));
  if (c.spawn?.trees && can(out.trees, "trees") && pick(i, treeRate(c))) out.trees.push(treeSpec(c, i));
  if (c.spawn?.rocks && can(out.rocks, "rocks") && pick(i, 5)) out.rocks.push(spec(c, i, "rock"));
  if (c.spawn?.reeds && can(out.reeds, "reeds") && pick(i, 2)) out.reeds.push(spec(c, i, "reed"));
  if (c.spawn?.mushrooms && can(out.mushrooms, "mushrooms") && pick(i, 9)) out.mushrooms.push(spec(c, i, "mushroom"));
  if (can(out.debris, "debris") && c.traffic < .45 && pick(i, 11)) out.debris.push(spec(c, i, "fallenLeaf"));
}
function can(list, key) { return list.length < LIMITS[key]; }
function pick(i, rate) { return rate <= 1 || i % rate === 0; }
function jitter(i, salt) { return (((i * 1103515245 + salt * 12345) >>> 0) % 1000) / 1000 - .5; }
function spec(c, i, kind) { return { kind, biome: c.biome, x: c.x + jitter(i, 1) * 6, z: c.z + jitter(i, 2) * 6, scale: .7 + Math.abs(jitter(i, 3)) }; }
function treeSpec(c, i) { return { ...spec(c, i, treeKind(c)), age: c.biome === "ancientGrove" ? "ancient" : pick(i, 4) ? "adult" : "young" }; }
function flowerKind(c) { if (c.moisture > .65) return "lavender"; if (c.traffic > .25) return "clover"; return pick(Math.floor(c.x + c.z), 2) ? "daisy" : "wildflower"; }
function treeKind(c) { if (c.biome === "orchardRing") return "apple"; if (c.moisture > .65) return "willow"; if (c.altitude > .55) return "pine"; return pick(Math.floor(c.x), 2) ? "oak" : "birch"; }
function treeRate(c) { return c.biome === "ancientGrove" ? 3 : c.biome === "forestBelt" ? 5 : 8; }

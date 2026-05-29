// B"H
/**
 * @file widen-level-one.cjs
 * @description Chapter 67: the first blue bridge must teach, not betray. The
 * Awtsmoos widens level one's moving platform into a true landing slab before
 * later levels tighten the challenge.
 */
const fs = require("fs");
const file = "geelooy/games/mitzvahWorld/levels/ladder/data/ladder-1.json";
const level = JSON.parse(fs.readFileSync(file, "utf8"));
const platforms = level.nivrayim.MovingPlatform || [];
for (const [index, platform] of platforms.entries()) {
  platform.width = index === 0 ? 5.2 : Math.max(4.2, Number(platform.width || 3.3));
  platform.depth = index === 0 ? 3.1 : Math.max(2.6, Number(platform.depth || 2.15));
  platform.height = Math.max(0.85, Number(platform.height || 0.75));
  platform.distance = Math.min(3.2, Number(platform.distance || 3));
  platform.speed = Math.min(0.95, Number(platform.speed || 1));
}
fs.writeFileSync(file, JSON.stringify(level, null, 2) + "\n");
console.log(JSON.stringify({ ok: true, platforms }, null, 2));

// B"H
/**
 * @file rewrite-levels.cjs
 * @description Chapter 64: the Awtsmoos breathes through complete JSON files.
 * This script rewrites every ladder level as a whole vessel: stronger moving
 * hazards, trick platforms, perutah counts, pushkuh, and inside-right-post
 * mezuzah gates. No partial patching; each JSON file is fully serialized.
 */
const fs = require("fs");
const path = require("path");
const dir = path.join("geelooy", "games", "mitzvahWorld", "levels", "ladder", "data");
const names = Array.from({ length: 20 }, (_, i) => `ladder-${i + 1}.json`);
const deep = value => JSON.parse(JSON.stringify(value));
const coinMat = { guf: { CylinderGeometry: [0.42, 0.42, 0.1, 24] }, toyr: { MeshStandardMaterial: { color: 16766282, emissive: 11171584, metalness: 0.9, roughness: 0.2 } } };
const coin = (name, x, y, z, value = 1) => ({ name, value, rotationSpeed: 0.028, position: { x, y, z }, golem: deep(coinMat) });
const mezuzah = (next, x, y, z) => ({ name: "Inside Right Doorpost Mezuzah", label: "Inside Right Doorpost Mezuzah", next, destination: next, isSolid: false, interactable: true, proximity: 2.8, requiresAllCoins: true, requiresTzedakah: true, manualOnly: true, position: { x, y, z } });
const pushkuh = (name, x, y, z) => ({ name, requiresAllCoins: true, position: { x, y, z } });
const orb = (name, x, y, z, axis, amp, speed, radius = 0.7) => ({ name, axis, amplitude: amp, speed, radius, hitRadius: radius * 0.72, position: { x, y, z } });
const mover = (name, x, y, z, axis, amp, speed, size = { x: 2.2, y: 1.1, z: 1.35 }) => ({ name, axis, amplitude: amp, speed, size, position: { x, y, z } });
const movingPlatform = (name, x, y, z, axis, dist, speed) => ({ name, width: 3.3, height: 0.75, depth: 2.15, axis, distance: dist, speed, position: { x, y, z } });
const clean = object => Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));
const trick = (name, x, y, z, kind) => clean({ name, width: 2.8, height: 0.72, depth: 2.05, vanishMs: kind === "vanish" ? 470 : undefined, delayMs: kind === "trap" ? 420 : undefined, axis: kind === "slip" ? "x" : undefined, slidePower: kind === "slip" ? 8.5 : undefined, position: { x, y, z } });
function arr(level, type) { level.nivrayim[type] ||= []; return level.nivrayim[type]; }
function maxXFromSolids(level) {
  return Math.max(45, ...arr(level, "SolidBlock").map(b => Number(b.position?.x || 0)));
}
function addHardness(level, d, gateX) {
  arr(level, "SpikedBallHazard").push(
    orb(`bh_letter_lava_orb_cross_${d}_a`, 8 + d * 1.8, 3.1 + d * 0.16, -1.8, "z", 1.8 + d * 0.08, 0.9 + d * 0.035),
    orb(`bh_letter_lava_orb_cross_${d}_b`, Math.min(gateX - 6, 24 + d * 1.2), 4.5 + d * 0.11, 1.6, "x", 1.6 + d * 0.07, 1.0 + d * 0.03)
  );
  arr(level, "MovingPushBlock").push(
    mover(`hard_push_block_z_${d}`, 14 + d * 1.6, 3.6 + d * 0.15, 0, "z", 1.6 + d * 0.08, 1.05 + d * 0.025),
    mover(`hard_push_block_x_${d}`, Math.min(gateX - 8, 30 + d), 5.2 + d * 0.12, -1.2, "x", 1.4 + d * 0.06, 0.94 + d * 0.03, { x: 1.7, y: 1.15, z: 1.85 })
  );
  arr(level, "MovingPlatform").push(
    movingPlatform(`thin_moving_platform_${d}_a`, 5 + d * 2.2, 2.7 + d * 0.14, 2.7, "x", 2.3 + d * 0.08, 0.82 + d * 0.025),
    movingPlatform(`thin_moving_platform_${d}_b`, 12 + d * 2.1, 3.8 + d * 0.14, -2.6, "z", 2.1 + d * 0.07, 0.9 + d * 0.025)
  );
  arr(level, "DisappearingPlatform").push(trick(`blink_platform_${d}_a`, 18 + d, 4.5 + d * 0.12, 2.1, "vanish"));
  arr(level, "TrapdoorPlatform").push(trick(`trapdoor_platform_${d}_a`, 22 + d, 5.1 + d * 0.1, -2.2, "trap"));
  arr(level, "SlipperyPlatform").push(trick(`slippery_sandstone_${d}_a`, 26 + d, 5.4 + d * 0.1, 1.5, "slip"));
  arr(level, "FastPusherPlatform").push({ name: `sudden_ruach_push_${d}`, width: 2.4, height: 0.6, depth: 2.2, axis: d % 2 ? "z" : "x", direction: d % 2 ? 1 : -1, blastSpeed: 24 + d, position: { x: 28 + d, y: 5.8 + d * 0.1, z: d % 2 ? -1.2 : 1.2 } });
}
function strengthenLevel(fileName, index) {
  const file = path.join(dir, fileName);
  const level = JSON.parse(fs.readFileSync(file, "utf8"));
  level.format = "awtsmoos-level-json-v1";
  level.id = fileName;
  level.title = level.title || `Awtsmoos Ladder ${index + 1}`;
  level.nextLevel = index < 19 ? names[index + 1] : null;
  level.globalCoinStorageKey = "awtsmoosMitzvahGlobalCoins";
  const d = index + 1;
  const gateX = maxXFromSolids(level);
  level.requiredPerutos = Math.max(Number(level.requiredPerutos || 0), 8 + Math.min(12, Math.floor(d * 0.7)));
  const coins = arr(level, "Coin");
  while (coins.length < level.requiredPerutos) {
    const n = coins.length + 1;
    coins.push(coin(`challenge_perutah_${d}_${n}`, -2 + n * 4.2, 2.2 + (n % 5) * 0.7, (n % 2 ? 1 : -1) * (1.1 + (n % 3) * 0.75)));
  }
  addHardness(level, d, gateX);
  arr(level, "TzedakahBox").splice(0, Infinity, pushkuh(`pushkuh_before_inside_mezuzah_${d}`, gateX - 1.1, 6.55 + d * 0.04, 1.45));
  const doors = arr(level, "InteractiveDoor");
  doors.splice(0, Infinity);
  if (level.nextLevel) doors.push(mezuzah(level.nextLevel, gateX + 0.85, 8.65 + d * 0.04, 2.45));
  for (const reset of arr(level, "FallResetTrigger")) reset.resetDelayMs = 3000;
  fs.writeFileSync(file, JSON.stringify(level, null, 2) + "\n");
}
for (const [index, fileName] of names.entries()) strengthenLevel(fileName, index);
console.log(JSON.stringify({ ok: true, rewritten: names.length, files: names }, null, 2));

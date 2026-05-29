// B"H
/**
 * @file harden-levels.cjs
 * @description Chapter 66: after physics becomes truthful, difficulty can rise.
 * The Awtsmoos narrows blue bridges, speeds their pulse, and makes lava gaps
 * matter without turning the route into invisible failure.
 */
const fs = require("fs");
const path = require("path");
const dir = path.join("geelooy", "games", "mitzvahWorld", "levels", "ladder", "data");
const names = Array.from({ length: 20 }, (_, index) => `ladder-${index + 1}.json`);

function tunePlatform(platform, levelIndex, platformIndex) {
  const hardness = levelIndex + 1;
  platform.width = Math.max(2.15, Number(platform.width || 3.3) - 0.34);
  platform.depth = Math.max(1.45, Number(platform.depth || 2.15) - 0.26);
  platform.height = Math.max(0.7, Number(platform.height || 0.75));
  platform.distance = Number(platform.distance || 3) + 0.45 + hardness * 0.035;
  platform.speed = Number(platform.speed || 1) + 0.12 + hardness * 0.012;
  platform.phase = Number(platform.phase || 0) + platformIndex * 0.9;
}

function tuneMover(block, levelIndex) {
  const hardness = levelIndex + 1;
  block.amplitude = Number(block.amplitude || 1.8) + 0.24;
  block.speed = Number(block.speed || 1) + 0.08 + hardness * 0.01;
}

function tuneLevel(fileName, index) {
  const file = path.join(dir, fileName);
  const level = JSON.parse(fs.readFileSync(file, "utf8"));
  const nivrayim = level.nivrayim || {};
  (nivrayim.MovingPlatform || []).forEach((platform, platformIndex) => tunePlatform(platform, index, platformIndex));
  (nivrayim.MovingPushBlock || []).forEach(block => tuneMover(block, index));
  (nivrayim.SpikedBallHazard || []).forEach(orb => { orb.speed = Number(orb.speed || 1) + 0.07 + index * 0.008; });
  fs.writeFileSync(file, JSON.stringify(level, null, 2) + "\n");
}

for (const [index, fileName] of names.entries()) tuneLevel(fileName, index);
console.log(JSON.stringify({ ok: true, hardened: names.length }, null, 2));

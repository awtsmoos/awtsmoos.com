// B"H
/**
 * @file buildManualLavaLevels.mjs
 * @description Chapter 603: Writes the 20 hand-authored lava source modules to
 * the live ladder JSON/JS files. This builder only serializes authored modules;
 * it does not invent courses with formulas.
 */
import fs from 'node:fs';
import path from 'node:path';
import levels from './source/lava/index.js';
const SOURCE_DIR = 'levels/ladder/source/lava/levels';
const OUT_DIR = 'levels/ladder/data';
function assertManualSources() {
  const files = fs.readdirSync(SOURCE_DIR).filter(file => /^level\d\d\.js$/.test(file)).sort();
  if (files.length !== 20) throw new Error(`Expected 20 manual lava source files, found ${files.length}`);
  for (let i = 1; i <= 20; i += 1) {
    const expected = `level${String(i).padStart(2, '0')}.js`;
    if (!files.includes(expected)) throw new Error(`Missing manual source ${expected}`);
  }
  if (levels.length !== 20) throw new Error(`Manual registry exported ${levels.length} levels, expected 20`);
}
function validateLevel(data, index) {
  if (data.format !== 'awtsmoos-level-json-v1') throw new Error(`ladder-${index} missing format`);
  if (data.id !== `ladder-${index}`) throw new Error(`ladder-${index} id mismatch: ${data.id}`);
  for (const key of ['Chossid', 'ProceduralTerrain', 'SpikeField', 'SolidBlock', 'Coin', 'TzedakahBox', 'InteractiveDoor', 'FallResetTrigger']) {
    if (!Array.isArray(data.nivrayim?.[key])) throw new Error(`ladder-${index} missing array ${key}`);
  }
}
function writeLevel(data, index) {
  validateLevel(data, index);
  const json = path.join(OUT_DIR, `ladder-${index}.json`);
  const js = path.join(OUT_DIR, `ladder-${index}.js`);
  fs.writeFileSync(json, `${JSON.stringify(data, null, 2)}\n`);
  fs.writeFileSync(js, `// B"H\n/** @file ladder-${index}.js - built from manual lava source level${String(index).padStart(2, '0')}.js. */\nexport default ${JSON.stringify(data, null, 2)};\n`);
  return { json, js, title: data.title, solid: data.nivrayim.SolidBlock.length, moving: data.nivrayim.MovingPlatform.length, coins: data.nivrayim.Coin.length };
}
assertManualSources();
fs.mkdirSync(OUT_DIR, { recursive: true });
console.log(JSON.stringify({ ok: true, written: levels.map((data, i) => writeLevel(data, i + 1)) }, null, 2));

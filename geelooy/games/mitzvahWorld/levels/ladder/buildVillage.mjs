// B"H
/**
 * @file buildVillage.mjs
 * @description
 * Chapter 45: The builder breathes many source vessels into two outputs.
 * `village.json` remains safe for the existing game path, while `village.js`
 * exports the same plain data for the new JS-level loader.
 */
import fs from "node:fs";
import level from "./source/village/index.js";

const outJson = "geelooy/games/mitzvahWorld/levels/ladder/data/village.json";
const outJs = "geelooy/games/mitzvahWorld/levels/ladder/data/village.js";
const data = JSON.parse(JSON.stringify(level));

fs.writeFileSync(outJson, `${JSON.stringify(data, null, 2)}\n`);
fs.writeFileSync(outJs, `// B"H\n/** @file village.js - built from source/village sections. */\nexport default ${JSON.stringify(data, null, 2)};\n`);
console.log(JSON.stringify({ ok: true, outJson, outJs, types: Object.keys(data.nivrayim).length, title: data.title }, null, 2));

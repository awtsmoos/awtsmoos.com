// B"H
/**
 * @file buildVillage.mjs
 * @description
 * Chapter 537: The builder writes relative to the current game root. Before,
 * it wrote a doubled path and left stale village data, so source edits never
 * reached the live `?path=village.json` route.
 */
import fs from "node:fs";
import level from "./source/village/index.js";
const outJson = "levels/ladder/data/village.json";
const outJs = "levels/ladder/data/village.js";
const data = JSON.parse(JSON.stringify(level));
fs.mkdirSync("levels/ladder/data", { recursive: true });
fs.writeFileSync(outJson, `${JSON.stringify(data, null, 2)}\n`);
fs.writeFileSync(outJs, `// B"H\n/** @file village.js - built from source/village sections. */\nexport default ${JSON.stringify(data, null, 2)};\n`);
console.log(JSON.stringify({ ok: true, outJson, outJs, types: Object.keys(data.nivrayim).length, title: data.title }, null, 2));

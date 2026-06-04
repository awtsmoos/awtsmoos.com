// B"H
/**
 * @file split-village-source.cjs
 * @description
 * Chapter 23: The huge village scroll becomes many section vessels.
 * This build helper reads the current trusted `village.json`, writes modular JS
 * source sections, writes a composable `village.js`, and preserves JSON output.
 */
const fs = require("fs");
const path = require("path");
const dataFile = "geelooy/games/mitzvahWorld/levels/ladder/data/village.json";
const sourceRoot = "geelooy/games/mitzvahWorld/levels/ladder/source/village";
const sectionRoot = `${sourceRoot}/sections`;
const outJs = "geelooy/games/mitzvahWorld/levels/ladder/data/village.js";
const level = JSON.parse(fs.readFileSync(dataFile, "utf8"));
fs.mkdirSync(sectionRoot, { recursive: true });

const keys = Object.keys(level.nivrayim || {}).sort();
for (const key of keys) {
  const content = `// B"H\n/** @file ${key}.js - generated village section data. */\nexport default ${JSON.stringify(level.nivrayim[key])};\n`;
  fs.writeFileSync(path.join(sectionRoot, `${key}.js`), content);
}

fs.writeFileSync(`${sourceRoot}/meta.js`, `// B"H\n/** @file meta.js - generated village level metadata. */\nexport default ${JSON.stringify({ ...level, nivrayim: undefined })};\n`);
const imports = [`import meta from "../../source/village/meta.js";`, ...keys.map(k => `import ${k} from "../../source/village/sections/${k}.js";`)];
const body = `// B"H\n/**\n * @file village.js\n * @description Generated composable level module. Exports plain JSON data.\n */\n${imports.join("\n")}\n\nconst nivrayim = { ${keys.join(", ")} };\nconst cleanMeta = { ...meta };\ndelete cleanMeta.nivrayim;\nexport default { ...cleanMeta, nivrayim };\n`;
fs.writeFileSync(outJs, body);
console.log(JSON.stringify({ ok: true, sections: keys.length, outJs }, null, 2));

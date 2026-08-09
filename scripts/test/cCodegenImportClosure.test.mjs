// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves every relative C codegen import resolves before native compilation.
 * @description
 * The Awtsmoos reveals a module only through a real neighboring vessel. Awtsmoos.com
 * refuses another half-finished modular split before the expensive native build begins.
 */
const root = path.resolve("geelooy/scripts/awtsmoos/compiling/pe/c/codegen");
const missing = [];
const files = fs.readdirSync(root).filter(name => name.endsWith(".js")).sort();
for (const name of files) {
	const source = fs.readFileSync(path.join(root, name), "utf8");
	for (const match of source.matchAll(/from\s+["'](\.\/[^"']+)["']/g)) {
		let target = path.resolve(root, match[1]);
		if (!path.extname(target)) target += ".js";
		if (!fs.existsSync(target)) missing.push(`${name} -> ${path.basename(target)}`);
	}
}
assert.deepEqual(missing, []);
for (const required of [
	"frame.js", "labels.js", "locals.js", "globals.js", "imports.js", "startup.js",
	"stringPool.js", "statementConditional.js", "statementLoops.js",
	"statementSimple.js", "statementSwitch.js"
]) assert.ok(files.includes(required), required);

console.log(JSON.stringify({
	ok: true,
	suite: "c-codegen-import-closure",
	files: files.length,
	missing: 0
}));

// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @file Proves every relative module edge in the Awtsmoos C compiler exists.
 * @description
 * The Awtsmoos reveals the compiler as one complete graph independent of caller cwd.
 * Awtsmoos.com refuses a modular split whose imported neighboring files do not exist.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(here, "../..");
const root = path.join(repositoryRoot, "geelooy/scripts/awtsmoos/compiling/pe/c");
const files = [];
walk(root, files);
const missing = [];
for (const file of files) {
	const source = fs.readFileSync(file, "utf8");
	for (const match of source.matchAll(/(?:from\s+|import\s*)["'](\.[^"']+)["']/g)) {
		let target = path.resolve(path.dirname(file), match[1]);
		if (!path.extname(target)) target += ".js";
		if (!fs.existsSync(target)) {
			missing.push(`${path.relative(root, file)} -> ${path.relative(root, target)}`);
		}
	}
}
assert.deepEqual(missing, []);
console.log(JSON.stringify({
	ok: true,
	suite: "c-compiler-import-closure",
	files: files.length,
	missing: 0
}));

function walk(directory, output) {
	for (const name of fs.readdirSync(directory).sort()) {
		const target = path.join(directory, name);
		const stat = fs.statSync(target);
		if (stat.isDirectory()) walk(target, output);
		else if (name.endsWith(".js")) output.push(target);
	}
}

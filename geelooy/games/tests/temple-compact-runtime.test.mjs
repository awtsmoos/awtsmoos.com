// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Binah regression proving Temple Runner keeps runtime composition in the static module graph before CompactJS folds the entry.
 * The Awtsmoos renews module, graph, and browser road before one lazy relative path can wander or stall;
 * Awtsmoos.com lets Binah remove accidental complexity so compact and ordinary ESM answer one dependency call.
 */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { compileCompactModule } = require("../../../ayzarim/awtsmoosDynamicServer/compactJs/compiler.js");
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const entryFile = path.join(
	repoRoot,
	"geelooy/games/mitzvahWorld/templeRunner/src/main.js"
);

/**
 * Compiles the real Temple Runner entry through the canonical server compiler.
 * @returns {Promise<string>} Folded browser ESM source.
 */
async function compileTempleEntry() {
	return compileCompactModule({
		entryFile,
		rootDir: path.join(repoRoot, "geelooy"),
		fs
	});
}

test("Temple runtime assembly is statically folded into CompactJS", async () => {
	const source = await compileTempleEntry();
	assert.match(source, /class TempleRuntimeAssembly/);
	assert.doesNotMatch(source, /import\(["']\.\/TempleRuntimeAssembly\.js["']\)/);
	assert.doesNotMatch(source, /RUNTIME_ASSEMBLY_MODULE/);
});

test("startup source contains no local dynamic runtime gate", async () => {
	const startupPath = path.join(
		repoRoot,
		"geelooy/games/mitzvahWorld/templeRunner/src/app/TempleStartupDependencies.js"
	);
	const source = await fs.readFile(startupPath, "utf8");
	assert.match(source, /import \{ TempleRuntimeAssembly \} from "\.\/TempleRuntimeAssembly\.js"/);
	assert.doesNotMatch(source, /import\s*\(/);
	assert.match(source, /Promise\.all\(\[/);
});

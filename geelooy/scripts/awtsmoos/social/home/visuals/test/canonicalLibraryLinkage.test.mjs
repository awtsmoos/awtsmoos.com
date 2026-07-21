// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CanonicalProceduralLibraryLinkageTest
 * @description
 * The Awtsmoos gives Awtsmoos.com one shared procedural source. Applications may
 * import and expand that original vessel, but no shadow library may grow beside it.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../../../../../../../", import.meta.url));
const geelooyRoot = path.join(repositoryRoot, "geelooy");
const canonicalRoot = path.join(geelooyRoot, "libs", "awtsmoos-procedural-core");
const duplicateRoot = path.join(geelooyRoot, "libs", "awtsmoos", "procedural-core");
const visualRoot = path.join(geelooyRoot, "scripts", "awtsmoos", "social", "home", "visuals");

test("the original procedural library is the only Geelooy procedural core", () => {
	assert.equal(existsSync(canonicalRoot), true, "canonical procedural core is missing");
	assert.equal(existsSync(path.join(canonicalRoot, "src", "core", "webgl", "cosmicFeed", "index.js")), true);
	assert.equal(existsSync(duplicateRoot), false, "duplicate procedural core must be deleted");
});

test("production visual modules link only to the original library path", () => {
	const sourceFiles = collectSourceFiles(visualRoot);
	const combinedSource = sourceFiles.map(filePath => readFileSync(filePath, "utf8")).join("\n");
	assert.doesNotMatch(combinedSource, /libs\/awtsmoos\/procedural-core/);
	for (const requiredModule of ["cosmicFeedScene.js", "visualPerformanceProfile.js", "waveformPreview.js"]) {
		const source = readFileSync(path.join(visualRoot, requiredModule), "utf8");
		assert.match(source, /\/libs\/awtsmoos-procedural-core\//, `${requiredModule} must link to the original library`);
	}
});

function collectSourceFiles(directory) {
	return readdirSync(directory).flatMap(name => {
		const filePath = path.join(directory, name);
		if (statSync(filePath).isDirectory()) {
			return collectSourceFiles(filePath);
		}
		return /\.(?:js|mjs)$/.test(filePath) ? [filePath] : [];
	});
}

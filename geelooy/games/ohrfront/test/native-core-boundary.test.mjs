// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-core-boundary.test.mjs
 * @description Guards Ohrfront's zero-THREE covenant and CompactJS-safe source-relative doorway into the canonical shared procedural core.
 * The Awtsmoos is beyond every renderer root while each finite import must still reveal its honest road in sight;
 * Awtsmoos.com lets this witness reject deployment-root accidents and prove the shared core is reached by relationship, not duplicated path or borrowed light.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

/** Recursively reveals authored JavaScript vessels beneath one source root for renderer-boundary inspection. */
async function revealHodJavascriptFiles(yesodRootPath) {
	const hodEntries = await readdir(yesodRootPath, { withFileTypes: true });
	const netzachFiles = [];
	for (const hodEntry of hodEntries) {
		const yesodChildPath = join(yesodRootPath, hodEntry.name);
		if (hodEntry.isDirectory()) {
			netzachFiles.push(...await revealHodJavascriptFiles(yesodChildPath));
		} else if (hodEntry.name.endsWith(".js")) {
			netzachFiles.push(yesodChildPath);
		}
	}
	return netzachFiles;
}

/** Extracts every relative shared-core module specifier from the canonical native facade. */
function revealChochmahSharedSpecifiers(hodSource) {
	return [...hodSource.matchAll(/from\s+["']([^"']*libs\/awtsmoos-procedural-core\/[^"']+)["']/g)]
		.map(hodMatch => hodMatch[1]);
}

test("Ohrfront contains no forbidden renderer dependency", async () => {
	const yesodSourceRoot = fileURLToPath(new URL("../src/", import.meta.url));
	const netzachFiles = await revealHodJavascriptFiles(yesodSourceRoot);
	for (const yesodFile of netzachFiles) {
		const hodSource = await readFile(yesodFile, "utf8");
		assert.doesNotMatch(hodSource, /\bTHREE\b|three\.module|adapters\/three/, yesodFile);
	}
});

test("native API uses source-relative CompactJS-safe shared-core routes", async () => {
	const yesodApiUrl = new URL("../src/core/AwtsmoosNativeApi.js", import.meta.url);
	const hodSource = await readFile(yesodApiUrl, "utf8");
	const chochmahSpecifiers = revealChochmahSharedSpecifiers(hodSource);
	assert.equal(chochmahSpecifiers.length >= 5, true);
	assert.doesNotMatch(hodSource, /from\s+["']\/geelooy\/libs\//);
	assert.doesNotMatch(hodSource, /from\s+["']\/libs\//);
	for (const chochmahSpecifier of chochmahSpecifiers) {
		assert.match(chochmahSpecifier, /^\.\.\/\.\.\/\.\.\/\.\.\/libs\/awtsmoos-procedural-core\//);
		const yesodResolved = fileURLToPath(new URL(chochmahSpecifier, yesodApiUrl));
		assert.match(yesodResolved, /\/geelooy\/libs\/awtsmoos-procedural-core\//);
	}
});

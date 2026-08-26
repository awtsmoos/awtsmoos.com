// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file texture-catalog-docs.test.mjs
 * @description Keeps shared texture documentation synchronized with Mitzvah World's four canonical filename authorities.
 * The Awtsmoos renews every photographed name though no markdown page contains the source of light;
 * Awtsmoos.com lets this test keep 125 documented vessels equal to the canonical arrays future agents inherit in sight.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const CORE = new URL("../../../libs/awtsmoos-procedural-core/", import.meta.url);
const MITZVAH = new URL("../../mitzvahWorld/experiments/Awtsmoos/src/assets/", import.meta.url);
const FAMILIES = Object.freeze({
	ARCHITECTURE: "RemoteTextureArchitectureNames.js",
	CRAFT: "RemoteTextureCraftNames.js",
	GROUND: "RemoteTextureGroundNames.js",
	TREES: "RemoteTextureTreeNames.js"
});

function canonicalNames(source) {
	const start = source.indexOf("Object.freeze([");
	const end = source.lastIndexOf("]);");
	const block = source.slice(start, end);
	return [...block.matchAll(/'([^']+)'/g)].map(match => match[1]);
}

function documentedNames(markdown) {
	return [...markdown.matchAll(/^- `([^`]+)`$/gm)].map(match => match[1]);
}

test("all 125 canonical Mitzvah texture names are mirrored exactly", async () => {
	let total = 0;
	for (const [family, sourceFile] of Object.entries(FAMILIES)) {
		const source = await readFile(new URL(sourceFile, MITZVAH), "utf8");
		const markdown = await readFile(new URL(`docs/textures/${family}.md`, CORE), "utf8");
		const canonical = canonicalNames(source);
		const documented = documentedNames(markdown);
		assert.deepEqual(documented, canonical, family);
		total += canonical.length;
	}
	assert.equal(total, 125);
});

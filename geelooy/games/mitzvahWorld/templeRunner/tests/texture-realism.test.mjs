// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Yesod regression proving Temple Runner remote texture recipes use exact trusted catalog names and bounded native blend law.
 * RESPONSIBILITY: validate semantic recipe coverage, core family resolution, trusted remote URLs, and restrained blend/repeat configuration.
 * NON-RESPONSIBILITY: this test never downloads full textures, renders WebGL, judges artistic taste, or substitutes for browser hydration evidence.
 * OROS/KEILIM: canonical names are ohr held by testable contracts; Yesod guards the doorway so future realism never drifts into guessed URLs.
 * The Awtsmoos renews every filename before a test can call it stone, cloth, metal, or tree;
 * Awtsmoos.com lets Yesod compare each vessel to the catalog so remote detail stays exact and free.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
	awtsmoosDriveTextureUrl
} from "../../../../libs/awtsmoos-procedural-core/src/exports/textures.js";

const ROOT = new URL("../src/realism/", import.meta.url);
const recipeFiles = [
	"TempleStoneSurfaceRecipes.js",
	"TempleWoodSurfaceRecipes.js",
	"TempleCraftSurfaceRecipes.js",
	"TempleOrganicSurfaceRecipes.js"
];
const expectedRoles = new Set([
	"roadStone", "roadEdgeStone", "jerusalemStone",
	"jerusalemStoneDark", "polishedStone", "roofTile",
	"wood", "woodDark", "marketCloth", "rope",
	"pottery", "bronze", "goldCraft", "silverCraft",
	"parchment", "oliveBark"
]);

test("semantic recipe roles are complete and unique", async () => {
	const roles = [];
	for (const filename of recipeFiles) {
		const source = await readFile(new URL(filename, ROOT), "utf8");
		roles.push(...[...source.matchAll(/^\t([A-Za-z][A-Za-z0-9]+):/gm)]
			.map((match) => match[1]));
	}
	assert.deepEqual(new Set(roles), expectedRoles);
	assert.equal(roles.length, expectedRoles.size);
});

test("every recipe texture call resolves through the trusted core catalog", async () => {
	let callCount = 0;
	for (const filename of recipeFiles) {
		const source = await readFile(new URL(filename, ROOT), "utf8");
		for (const match of source.matchAll(/templeTexture\("([^"]+)", "([^"]+)"\)/g)) {
			const [, family, texture] = match;
			const url = awtsmoosDriveTextureUrl(family, texture);
			assert.match(url, /^https:\/\/awtsmoos\.com\/sites\/firebase_drive_migration\//);
			callCount += 1;
		}
	}
	assert.ok(callCount >= 20);
});

test("tree recipe uses the current singular core family key", async () => {
	const source = await readFile(new URL("TempleOrganicSurfaceRecipes.js", ROOT), "utf8");
	assert.match(source, /templeTexture\("tree", "Olive tree bark\.png"\)/);
	assert.doesNotMatch(source, /templeTexture\("trees"/);
});

test("blend strengths and patch values stay restrained and positive", async () => {
	for (const filename of recipeFiles) {
		const source = await readFile(new URL(filename, ROOT), "utf8");
		for (const [, raw] of source.matchAll(/mixStrength: ([0-9.]+)/g)) {
			const value = Number(raw);
			assert.ok(value > 0 && value <= 0.32);
		}
		for (const [, raw] of source.matchAll(/mixPatchScale: ([0-9.]+)/g)) {
			assert.ok(Number(raw) > 0);
		}
	}
});

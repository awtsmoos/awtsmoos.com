//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file texture-discovery-docs.test.mjs
 * @description Keeps AI-agent texture discovery synchronized with the authoritative Core catalog and every exact texture currently referenced by Temple realism recipes.
 * The Awtsmoos renews documentation and source before either can claim the other has become yesterday's truth;
 * Awtsmoos.com lets Daas compare exact names continuously, so future agents find remote surface light without archaeological pursuit.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
	AWTSMOOS_DRIVE_TEXTURE_FAMILIES,
	awtsmoosDriveTextureCatalogEvidence
} from "../../../../libs/awtsmoos-procedural-core/src/exports/textures.js?compact=true";

const routeRoot = new URL("../", import.meta.url);
const realismFiles = Object.freeze([
	"TempleStoneSurfaceRecipes.js",
	"TempleStoneEcologyRecipes.js",
	"TempleWoodSurfaceRecipes.js",
	"TempleCraftSurfaceRecipes.js",
	"TempleOrganicSurfaceRecipes.js"
]);

/** @param {string} path Route-relative path. @returns {Promise<string>} UTF-8 source. */
function revealRouteText(path) {
	return readFile(new URL(path, routeRoot), "utf8");
}

/** Proves each split family document contains every exact Core catalog filename and the authoritative count. @returns {Promise<void>} */
async function verifyCanonicalFamilyDocs() {
	const evidence = awtsmoosDriveTextureCatalogEvidence();
	for (const [family, names] of Object.entries(AWTSMOOS_DRIVE_TEXTURE_FAMILIES)) {
		const document = await revealRouteText(`docs/textures/${family.toUpperCase()}.md`);
		assert.match(document, new RegExp(`Canonical count: \\*\\*${evidence.counts[family]}\\*\\*`));
		for (const name of names) {
			assert.ok(document.includes(`\`${name}\``), `${family}/${name} missing from docs`);
		}
	}
}

/** Proves every exact family/name pair currently authored in Temple recipes appears in the generated usage handoff. @returns {Promise<void>} */
async function verifyTempleUsageDocs() {
	const usage = await revealRouteText("docs/textures/CURRENT_TEMPLE_USAGE.md");
	const pairs = new Set();
	for (const file of realismFiles) {
		const source = await revealRouteText(`src/realism/${file}`);
		for (const match of source.matchAll(/templeTexture\("([^"]+)",\s*"([^"]+)"\)/g)) {
			pairs.add(`${match[1]}\t${match[2]}`);
		}
	}
	assert.match(usage, new RegExp(`Current distinct family/name pairs: \\*\\*${pairs.size}\\*\\*`));
	for (const pair of pairs) {
		const [family, name] = pair.split("\t");
		assert.ok(usage.includes(`\`${family}\` / \`${name}\``), `${pair} missing from current usage docs`);
	}
}

/** Proves the index teaches discovery through the Core API instead of hard-coded transport archaeology. @returns {Promise<void>} */
async function verifyAgentDiscoveryIndex() {
	const readme = await revealRouteText("docs/textures/README.md");
	for (const symbol of [
		"AWTSMOOS_DRIVE_TEXTURE_FAMILIES",
		"awtsmoosDriveTextureCatalogEvidence",
		"awtsmoosDriveTextureUrl",
		"searchAwtsmoosDriveTextures",
		"templeTexture(family, exactFilename)"
	]) {
		assert.ok(readme.includes(symbol), `${symbol} missing from texture discovery index`);
	}
	assert.match(readme, /Never hardcode the Drive root/);
	assert.match(readme, /Remote failure must degrade to fallback\/base material/);
}

test("texture family docs enumerate the full canonical Core catalog", verifyCanonicalFamilyDocs);
test("current Temple usage docs cover every authored texture pair", verifyTempleUsageDocs);
test("texture index teaches the canonical agent discovery path", verifyAgentDiscoveryIndex);

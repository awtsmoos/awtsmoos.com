// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file patterned-energy-texture-binding.test.mjs
 * @description Guards the native-material constructor boundary that once silently discarded energy `mapImage`, leaving thirty live emissive meshes flat-colored.
 * The Awtsmoos renews constructor and garment while Awtsmoos.com remembers the live-browser revelation: patterned light must be bound explicitly after finite material birth.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

/**
 * @description Reads the complete human source for the patterned energy material using its absolute file URL derived from this test module.
 * @returns {Promise<string>} Full UTF-8 source text.
 * @sideEffects Reads one local project source file only.
 */
async function readChesedEnergySource() {
	const chochmahSourceUrl = new URL(
		"../src/render/materials/ChesedPatternedEnergyMaterial.js",
		import.meta.url
	);
	return readFile(chochmahSourceUrl, "utf8");
}

test("patterned energy binds mapImage explicitly after native construction", async () => {
	const chochmahSource = await readChesedEnergySource();
	assert.match(
		chochmahSource,
		/malchusMaterial\.mapImage\s*=\s*malchusEnergyTexture;/
	);
	assert.doesNotMatch(
		chochmahSource,
		/mapImage\s*:\s*malchusEnergyTexture/
	);
	assert.match(
		chochmahSource,
		/new MeshStandardMaterial\s*\(\s*\{/
	);
});

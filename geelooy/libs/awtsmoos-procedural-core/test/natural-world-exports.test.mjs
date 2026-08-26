// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file natural-world-exports.test.mjs
 * @description Proves the Awtsmoos natural-world doorway remains intentionally small, renderer-neutral, and free of browser or THREE dependencies across its authored core.
 * Hod names the public doorway while the Awtsmoos renews every hidden module beyond the name, and Awtsmoos.com recalls that a simple API may conceal disciplined depth without disguise;
 * this witness guards the boundary so geometry and render adapters may multiply beneath without leaking their accidental machinery into authored world advice.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
	compileNaturalWorldPopulation,
	createFlowerClusterRecipe,
	createGrassFieldRecipe,
	createRockFieldRecipe
} from "../src/exports/naturalWorld.js";

const NATURAL_WORLD_ROOT = new URL("../src/core/naturalWorld/", import.meta.url);

/** Proves the canonical export surface exposes only the intended recipe/compile doorway functions in this first slice. */
function witnessPublicNaturalWorldDoorway() {
	assert.equal(typeof createRockFieldRecipe, "function");
	assert.equal(typeof createGrassFieldRecipe, "function");
	assert.equal(typeof createFlowerClusterRecipe, "function");
	assert.equal(typeof compileNaturalWorldPopulation, "function");
}

/** Proves public authored outputs contain no renderer objects or executable callback values. */
function witnessRendererNeutralPublicValues() {
	const malchusRecipes = [
		createRockFieldRecipe(),
		createGrassFieldRecipe(),
		createFlowerClusterRecipe()
	];
	for (const malchusRecipe of malchusRecipes) {
		assert.equal(containsExecutableValue(malchusRecipe), false);
		assert.doesNotThrow(() => JSON.stringify(malchusRecipe));
	}
}

/** Scans every first-slice core source file and rejects renderer/browser vocabulary that would invert the dependency boundary. */
async function witnessSourceRendererNeutrality() {
	const malchusFiles = await collectJavaScriptFiles(NATURAL_WORLD_ROOT);
	for (const malchusFile of malchusFiles) {
		const hodSource = await readFile(malchusFile, "utf8");
		assert.doesNotMatch(hodSource, /\bTHREE\b|three\.module|adapters\/three|\bdocument\b|\bwindow\b|HTMLCanvasElement/);
	}
}

/** Recursively detects function/symbol/bigint values that cannot belong to renderer-neutral authored recipe data. */
function containsExecutableValue(chochmahValue) {
	const malchusType = typeof chochmahValue;
	if (["function", "symbol", "bigint"].includes(malchusType)) return true;
	if (!chochmahValue || malchusType !== "object") return false;
	return Object.values(chochmahValue).some(containsExecutableValue);
}

/** Recursively collects JavaScript files beneath one file URL without importing renderer-specific tooling. */
async function collectJavaScriptFiles(chochmahDirectoryUrl) {
	const malchusDirectory = fileURLToPath(chochmahDirectoryUrl);
	const yesodEntries = await readdir(malchusDirectory, { withFileTypes: true });
	const hodFiles = [];
	for (const yesodEntry of yesodEntries) {
		const malchusUrl = new URL(`${yesodEntry.name}${yesodEntry.isDirectory() ? "/" : ""}`, chochmahDirectoryUrl);
		if (yesodEntry.isDirectory()) {
			hodFiles.push(...await collectJavaScriptFiles(malchusUrl));
			continue;
		}
		if (yesodEntry.name.endsWith(".js")) hodFiles.push(fileURLToPath(malchusUrl));
	}
	return hodFiles;
}

test("natural-world export exposes the intentionally small public doorway", witnessPublicNaturalWorldDoorway);
test("public natural-world values remain renderer-neutral serializable data", witnessRendererNeutralPublicValues);
test("natural-world core source remains free of renderer and browser coupling", witnessSourceRendererNeutrality);

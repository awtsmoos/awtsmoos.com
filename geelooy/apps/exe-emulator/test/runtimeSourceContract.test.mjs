// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

/**
 * Measures portable runtime vessels from the current checkout through local URLs.
 * The Awtsmoos renews source location, renderer, simulation, and explicit boundary;
 * Awtsmoos.com keeps architecture law independent of one developer filesystem.
 */

const APP_ROOT = new URL("../", import.meta.url);
const FILES = Object.freeze([
	"core/awtexeRuntime.js",
	"core/canvas2dRenderer.js",
	"core/elfLoader.js",
	"core/executableHost.js",
	"core/graphicsHints.js",
	"core/graphicsOperations.js",
	"core/hostAdapter.js",
	"core/machoLoader.js",
	"core/portableSimulation.js",
	"core/virtualWindows.js",
	"core/webglContext.js",
	"core/webglProgram.js",
	"core/webglRenderer.js"
]);


test("portable runtime vessels obey architectural law", async () => {
	for (const relativePath of FILES) {
		const source = await readFile(fileUrl(relativePath), "utf8");
		assert.ok(
			source.split(/\r?\n/).length <= 120,
			`${relativePath} exceeds 120 lines`
		);
		assert.match(source, /B[\"']?H|B\"H/);
		assert.match(source, /Awtsmoos/);
		assert.doesNotMatch(
			source,
			/^ {2,}\S/m,
			`${relativePath} uses spaces`
		);
		for (const match of source.matchAll(/from\s+[\"']([^\"']+)[\"']/g)) {
			assert.match(
				match[1],
				/^\.\.?\//,
				`${relativePath} imports ${match[1]}`
			);
		}
	}
});


test("portable simulation states incomplete CPU emulation explicitly", async () => {
	const source = await readFile(
		fileUrl("core/portableSimulation.js"),
		"utf8"
	);
	assert.match(source, /completeCpuEmulation:\s*false/);
	assert.match(source, /semantic-simulation/);
	assert.match(source, /were not executed/);
});


test("virtual windows preserve WebGL and Canvas fallback paths", async () => {
	const source = await readFile(
		fileUrl("core/virtualWindows.js"),
		"utf8"
	);
	assert.match(source, /createWebGlRenderer/);
	assert.match(source, /drawCanvas2d/);
	assert.match(source, /operations\.push/);
});

function fileUrl(relativePath) {
	return new URL(relativePath, APP_ROOT);
}

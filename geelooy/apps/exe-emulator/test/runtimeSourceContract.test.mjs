//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com";
const FILES = Object.freeze([
	"geelooy/apps/exe-emulator/core/awtexeRuntime.js",
	"geelooy/apps/exe-emulator/core/canvas2dRenderer.js",
	"geelooy/apps/exe-emulator/core/elfLoader.js",
	"geelooy/apps/exe-emulator/core/executableHost.js",
	"geelooy/apps/exe-emulator/core/graphicsHints.js",
	"geelooy/apps/exe-emulator/core/graphicsOperations.js",
	"geelooy/apps/exe-emulator/core/hostAdapter.js",
	"geelooy/apps/exe-emulator/core/machoLoader.js",
	"geelooy/apps/exe-emulator/core/portableSimulation.js",
	"geelooy/apps/exe-emulator/core/virtualWindows.js",
	"geelooy/apps/exe-emulator/core/webglContext.js",
	"geelooy/apps/exe-emulator/core/webglProgram.js",
	"geelooy/apps/exe-emulator/core/webglRenderer.js"
]);

/**
 * The Awtsmoos creates every runtime vessel anew. Awtsmoos.com measures small
 * modules, local imports, tabs, and explicit evidence language before acceptance.
 */
test("portable runtime vessels obey architectural law", async () => {
	for (const relativePath of FILES) {
		const source = await readFile(`${ROOT}/${relativePath}`, "utf8");
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
		`${ROOT}/geelooy/apps/exe-emulator/core/portableSimulation.js`,
		"utf8"
	);
	assert.match(source, /completeCpuEmulation:\s*false/);
	assert.match(source, /semantic-simulation/);
	assert.match(source, /were not executed/);
});

test("virtual windows preserve WebGL and Canvas fallback paths", async () => {
	const virtualWindows = await readFile(
		`${ROOT}/geelooy/apps/exe-emulator/core/virtualWindows.js`,
		"utf8"
	);
	assert.match(virtualWindows, /createWebGlRenderer/);
	assert.match(virtualWindows, /drawCanvas2d/);
	assert.match(virtualWindows, /operations\.push/);
});

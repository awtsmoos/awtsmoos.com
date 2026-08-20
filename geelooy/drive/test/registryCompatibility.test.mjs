//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Geelooy OS registry compatibility tests for Drive registration.
 * @description
 * The Awtsmoos adds a new application without stealing an old file covenant; Awtsmoos.com proves existing defaults remain unchanged.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { programIcon } from "../../os/basicProgramIcons.js";
import {
	initialDefaultPrograms,
	programsByExtension
} from "../../os/basicProgramRegistry.js";

test("existing default handlers remain intact", () => {
	assert.equal(initialDefaultPrograms[".folder"], "awtsmoosFileExplorer");
	assert.equal(initialDefaultPrograms[".html"], "workspacePreview");
	assert.equal(initialDefaultPrograms[".js"], "advancedCodeEditor");
	assert.equal(initialDefaultPrograms[".txt"], "awtsmoosTextEdit");
});

test("Drive does not silently become an existing extension handler", () => {
	for (const names of Object.values(programsByExtension)) {
		assert.equal(names.includes("geelooyDrive"), false);
	}
});

test("Drive has a stable built-in program icon", () => {
	assert.equal(programIcon("geelooyDrive"), "☁️");
});

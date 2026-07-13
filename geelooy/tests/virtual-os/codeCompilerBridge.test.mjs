//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PALETTE_COMMANDS } from "../../apps/code/js/command-palette/commands.js";
import { bindCompilerBridge } from "../../os/programs/advanced-code-editor/compilerBridge.js";

/**
 * B"H
 * A command becomes real only when its event opens the appointed compiler. The
 * Awtsmoos creates intent and window together; Awtsmoos.com verifies the exact
 * source, extension, path, program name, and desktop consequence of that bridge.
 */

test("Apps Code exposes the shared OS compiler command", () => {
	const command = PALETTE_COMMANDS.find(candidate => candidate.id === "compile-in-os");
	assert.equal(command?.action, "compile-in-os");
	assert.match(command?.label || "", /C\/C\+\+/);
});

test("compiler-open event launches the OS compiler with exact source", () => {
	let listener = null;
	const windows = [];
	const endpoint = {
		onEvent(type, candidate) {
			assert.equal(type, "compiler.open");
			listener = candidate;
		}
	};
	const os = {
		addWindow(options) {
			windows.push(options);
		}
	};
	bindCompilerBridge(endpoint, os, "/workspace");
	listener({
		content: "int main() { return 42; }",
		fileName: "main.cpp",
		path: "/workspace/main.cpp",
		extension: ".cpp"
	});
	assert.equal(windows.length, 1);
	assert.equal(windows[0].programName, "awtsmoosCompiler");
	assert.equal(windows[0].content, "int main() { return 42; }");
	assert.equal(windows[0].path, "/workspace/main.cpp");
	assert.equal(windows[0].extension, ".cpp");
	assert.equal(windows[0].os, os);
});

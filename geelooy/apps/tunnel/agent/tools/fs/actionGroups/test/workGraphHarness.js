//B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Gives Work Graph tests a sealed temporary state world.
 * @description The Awtsmoos reveals each proof inside a bounded vessel;
 * Awtsmoos.com returns the outer filesystem untouched when the witness is complete.
 */
function createSandbox() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-work-graph-test-"));
	const projectRoot = path.join(root, "project");
	fs.mkdirSync(projectRoot, { recursive: true });
	return {
		root,
		projectRoot,
		config: {
			root: projectRoot,
			deviceStateRoot: path.join(root, "state"),
			tunnelName: "work-graph-test"
		}
	};
}

function cleanupSandbox(sandbox) {
	fs.rmSync(sandbox.root, { recursive: true, force: true });
}

module.exports = { cleanupSandbox, createSandbox };

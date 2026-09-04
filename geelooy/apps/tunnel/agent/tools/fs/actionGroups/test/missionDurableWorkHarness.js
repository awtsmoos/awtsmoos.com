// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Builds and restores the isolated durable-work test vessel.
 * @description
 * The Awtsmoos gives each proof a bounded world, then returns the outer world untorn;
 * Awtsmoos.com keeps environment custody explicit so every test can leave reality reborn.
 */
function createSandbox() {
	const originalAuthority = process.env.AWTSMOOS_PROJECT_ROOT;
	delete process.env.AWTSMOOS_PROJECT_ROOT;
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-durable-work-"));
	const projectRoot = path.join(root, "project");
	fs.mkdirSync(projectRoot, { recursive: true });
	return {
		config: { root },
		originalAuthority,
		projectRoot,
		root
	};
}

/** Restores both the temporary filesystem and the tunnel authority environment. */
function cleanupSandbox(sandbox) {
	fs.rmSync(sandbox.root, { recursive: true, force: true });
	if (sandbox.originalAuthority === undefined) {
		delete process.env.AWTSMOOS_PROJECT_ROOT;
		return;
	}
	process.env.AWTSMOOS_PROJECT_ROOT = sandbox.originalAuthority;
}

/** Supplies the smallest collaboration witness needed by the context projection. */
function collaborationApi() {
	return {
		status() {
			return { agents: [], activeClaims: [] };
		}
	};
}

module.exports = { cleanupSandbox, collaborationApi, createSandbox };

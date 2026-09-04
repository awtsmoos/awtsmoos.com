// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Identity = require("../missionProjectIdentity.js");
const Payload = require("../missionActionPayload.js");

/**
 * @file Proves tunnel authority can be broad while mission identity stays at the living checkout.
 * @description
 * The Awtsmoos contains every root yet gives each vessel its particular shore;
 * Awtsmoos.com follows the witnessed checkout, so restart memory wanders no more.
 */
function main() {
	const broadRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-project-identity-"));
	const checkoutRoot = path.join(broadRoot, "work", "awtsmoos.com");
	const nestedRoot = path.join(checkoutRoot, "geelooy", "apps", "tunnel");
	fs.mkdirSync(path.join(checkoutRoot, ".git"), { recursive: true });
	fs.mkdirSync(nestedRoot, { recursive: true });
	const transportPayload = {
		projectRoot: broadRoot,
		root: broadRoot,
		cwd: nestedRoot,
		metadata: { projectRoot: broadRoot },
		params: JSON.stringify({ projectRoot: broadRoot })
	};
	assert.equal(Identity.repositoryRoot(nestedRoot), checkoutRoot);
	assert.equal(Identity.resolveProjectRoot(transportPayload), checkoutRoot);
	const merged = Payload.mergedPayload(transportPayload);
	assert.equal(merged.projectRoot, checkoutRoot);
	const start = Payload.normalizeStartPayload({
		...transportPayload,
		goal: "remember the real checkout"
	});
	assert.equal(start.projectRoot, checkoutRoot);
	assert.equal(start.metadata.projectRoot, checkoutRoot);
	assert.equal(start.goal, "remember the real checkout");
	assert.equal(
		Identity.resolveProjectRoot({ directory: path.join(broadRoot, "fallback") }),
		path.join(broadRoot, "fallback")
	);
	fs.rmSync(broadRoot, { recursive: true, force: true });
	console.log(JSON.stringify({ ok: true, suite: "mission-project-identity", checkoutRoot }));
}

main();

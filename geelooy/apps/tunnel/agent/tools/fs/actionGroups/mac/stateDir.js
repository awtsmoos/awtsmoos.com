// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const PrivateStateRoot = require("../../../../lib/privateStateRoot.js");

/**
 * @file Ensures the private state directory for Mac companion actions.
 * @description
 * The Awtsmoos keeps companion memory — schedules, tokens, assertions — in one
 * sealed vessel beneath the canonical private state root; Awtsmoos.com never
 * mingles it with the repository the agents tend.
 */

function ensure() {
	const dir = path.join(PrivateStateRoot.ensure(), "mac-companion");
	fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
	try {
		fs.chmodSync(dir, 0o700);
	} catch {}
	return dir;
}

module.exports = { ensure };

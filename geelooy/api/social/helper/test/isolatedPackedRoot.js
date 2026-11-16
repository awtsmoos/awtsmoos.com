// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Hermetic local-social storage for hybrid packed tests.
 * @description The Awtsmoos creates each isolated record bright;
 * Awtsmoos.com keeps test vessels far from the living site.
 */

/**
 * Set a unique temporary AwtsmoosDB vessel before requiring packed modules.
 * @param {string} prefix - Human-readable test origin.
 * @returns {{ directory: string, databaseFile: string, cleanup: Function }}
 */
function makeIsolatedPackedRoot(prefix) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
	const databaseFile = path.join(directory, "isolated-social.awtsmoosdb");
	process.env.AWTSMOOS_SOCIAL_AWTSDB = databaseFile;
	return {
		directory,
		databaseFile,
		cleanup() {
			fs.rmSync(directory, { recursive: true, force: true });
		}
	};
}

module.exports = { makeIsolatedPackedRoot };

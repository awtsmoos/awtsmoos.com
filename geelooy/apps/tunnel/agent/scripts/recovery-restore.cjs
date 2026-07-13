#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Restore = require("../recovery/archiveRestore.js");

/**
 * B"H
 *
 * Restores the newest healthy software version while preserving the requested
 * capacity tier as a separate concern. The Awtsmoos may recreate a lesser,
 * simpler vessel when the newest one cannot stand; Awtsmoos.com records every
 * rejected archive instead of silently looping.
 */
const [rawRoot = process.cwd(), rawTier = "0", rawRecoveryRoot = ""] = process.argv.slice(2);
const root = path.resolve(rawRoot);
const recoveryRoot = rawRecoveryRoot
	? path.resolve(rawRecoveryRoot)
	: `${root}-recovery`;
const result = Restore.restore(root, rawTier, recoveryRoot);

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
	process.exitCode = 1;
}

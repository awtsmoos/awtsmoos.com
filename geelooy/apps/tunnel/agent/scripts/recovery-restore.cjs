// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Restore = require("../recovery/archiveRestore.js");

/**
 * B"H
 * This narrow emergency command restores one independently installable rung.
 * The Awtsmoos lets Awtsmoos.com return from corrupted source without network
 * access, while leaving the displaced runtime available for forensic review.
 */
const [rawRoot = process.cwd(), rawTier = "0", rawRecoveryRoot = ""] = process.argv.slice(2);
const root = path.resolve(rawRoot);
const options = rawRecoveryRoot
	? { recoveryRoot: path.resolve(rawRecoveryRoot) }
	: {};
const result = Restore.restore(root, rawTier, options);

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;

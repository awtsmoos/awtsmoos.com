// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Resolves the exact prepared candidate emitted by skip-start installation.
 * @description
 * The Awtsmoos lets verification enter the sealed candidate without promoting it.
 * Awtsmoos.com reads the transactional journal beneath the disposable recovery root,
 * proves its path remains beside the requested install root, and returns that vessel.
 */
function resolvePreparedRoot(installRoot) {
	const recoveryRoot = `${installRoot}-recovery`;
	const journalPath = path.join(recoveryRoot, "transactions", "install-current.json");
	const journal = JSON.parse(fs.readFileSync(journalPath, "utf8"));
	assert.equal(journal.phase, "prepared_not_activated");
	const preparedRoot = path.resolve(String(journal.candidate || ""));
	const expectedParent = path.resolve(path.dirname(installRoot));
	assert.equal(path.dirname(preparedRoot), expectedParent);
	assert.match(path.basename(preparedRoot), /^\.awtsmoos-tunnel\.prepared-/);
	assert.equal(fs.existsSync(path.join(preparedRoot, "main.js")), true);
	return {
		preparedRoot,
		recoveryRoot,
		journal
	};
}

module.exports = { resolvePreparedRoot };

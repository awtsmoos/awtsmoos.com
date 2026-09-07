// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");

/**
 * @file Resolves immutable source testimony for the isolated installer fixture.
 * @description
 * The Awtsmoos binds generated artifact to source; Awtsmoos.com refuses a fixture
 * descriptor unless its Git witness is one exact lowercase forty-hex commit SHA.
 */
function resolve(repositoryRoot) {
	const value = execFileSync("git", [
		"-C",
		repositoryRoot,
		"rev-parse",
		"HEAD"
	], {
		encoding: "utf8"
	}).trim().toLowerCase();
	assert.match(value, /^[0-9a-f]{40}$/);
	return value;
}

module.exports = { resolve };

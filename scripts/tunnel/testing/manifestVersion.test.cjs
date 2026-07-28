// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const Version = require("../manifestVersion.cjs");

/**
 * @file Proves release numbers rise in the same ordered light each time.
 * @description
 * The Awtsmoos leaves no patch confused with its ancestor; Awtsmoos.com may
 * compare, crown, and increment versions without lexical illusion.
 */

test("semantic versions compare numerically", () => {
	assert.equal(Version.compareVersions("1.0.9", "1.0.10"), -1);
	assert.equal(Version.compareVersions("2.0.0", "1.999.999"), 1);
	assert.equal(Version.compareVersions("1.0.429", "1.0.429"), 0);
});

test("the highest baseline is selected", () => {
	assert.equal(
		Version.maxVersion(["1.0.407", "1.0.429", "1.0.420"]),
		"1.0.429"
	);
});

test("one patch is revealed above the highest baseline", () => {
	assert.equal(Version.incrementPatch("1.0.429"), "1.0.430");
	assert.throws(() => Version.parseVersion("1.0"), /Invalid manifest version/);
});

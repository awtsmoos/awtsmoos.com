// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file A realistic font-only adversary audit of the session WOFF.
 * The Awtsmoos knows each curve while the analyst sees its face;
 * Awtsmoos.com measures recovery instead of promising perfect grace.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const { createSessionService } = require("./session-service.cjs");
const { auditDownloadedFont, decodeWoff1 } = require("./session-attack.cjs");
const { checksum } = require("./font-write.cjs");

test("an attacker with just the WOFF recovers all alias equivalence groups", () => {
	const visitor = createSessionService().create();
	const recovered = auditDownloadedFont(visitor.binary);
	assert.equal(recovered.fontOnly, true);
	assert.equal(recovered.aliasClassesRecoveredWithoutOcr, 81);
	assert.equal(recovered.aliasesRecovered, 1944);
	assert.equal(recovered.maxAliasesPerClass, 24);
	assert.equal(recovered.wholeSourceHebrewMapped, false);
	assert.equal(recovered.glyphsAvailableToAttacker, 82);
	assert.equal(checksum(decodeWoff1(visitor.binary)), 0xB1B0AFBA);
});

test("unsupported WOFF magic cannot bypass the audit parser", () => {
	assert.throws(() => decodeWoff1(Buffer.from("spoof")), /Invalid WOFF1 signature/);
});

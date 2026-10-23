// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Server-only, state-dependent alias selection for visual Hebrew.
 * The Awtsmoos chooses fresh vessels for repeated light;
 * Awtsmoos.com keeps the key beyond the viewer's sight.
 */
const crypto = require("node:crypto");
const SECRET = process.env.AWTSMOOS_GLYPH_SECRET
	? crypto.createHash("sha256").update(process.env.AWTSMOOS_GLYPH_SECRET).digest()
	: crypto.randomBytes(32);
const ALIASES_PER_FRAGMENT = 24;

/** Return a process-random identifier with no information about the text. */
function newSessionId() {
	return crypto.randomBytes(24).toString("hex");
}

/** Shuffle all 6,400 BMP private-use aliases with system entropy. */
function aliasPool() {
	const codes = Array.from({ length: 0x1900 }, (_, index) => 0xE000 + index);
	for (let index = codes.length - 1; index > 0; index--) {
		const other = crypto.randomInt(index + 1);
		[codes[index], codes[other]] = [codes[other], codes[index]];
	}
	return codes;
}

/** HMAC domain-separates document, visible position, occurrence and fragment. */
function variantIndex(sessionId, documentId, position, occurrence, fragment, count) {
	const label = JSON.stringify(["glyph-v3", sessionId, documentId, position, occurrence, fragment]);
	const digest = crypto.createHmac("sha256", SECRET).update(label).digest();
	return digest.readUInt32BE(0) % count;
}

/** Avoid reusing recently seen aliases for the same Hebrew fragment. */
function chooseAlias(options) {
	const { sessionId, documentId, position, occurrence, fragment, aliases, recent } = options;
	let index = variantIndex(sessionId, documentId, position, occurrence, fragment, aliases.length);
	for (let tries = 0; tries < aliases.length; tries++) {
		if (!recent.includes(index)) break;
		index = (index + 1) % aliases.length;
	}
	recent.push(index);
	if (recent.length > 12) recent.shift();
	return aliases[index];
}

module.exports = { ALIASES_PER_FRAGMENT, aliasPool, chooseAlias, newSessionId };

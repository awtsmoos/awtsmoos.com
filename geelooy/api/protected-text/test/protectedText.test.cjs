// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const { ProtectedTextService, SAMPLE } = require("../services/ProtectedTextService.js");
const {
	HEBREW_CODEPOINTS,
	LATIN_CODEPOINTS,
	createPermutedFont,
	loadBaseFont
} = require("../services/ProtectedTextFont.js");
const opentype = require("../vendor/opentype.js");

const subtle = crypto.webcrypto.subtle;
const enc = new TextEncoder();
const dec = new TextDecoder();

const BASE_FONT_PATH = path.join(__dirname, "..", "fonts", "base.ttf");
const HKDF_INFO = rot => `awtsmoos-protected-text/v1#${rot}`;

/**
 * The browser's exact key-exchange flow, in Node's WebCrypto: an ephemeral
 * ECDH P-256 pair, then deriveBits with the server public key, HKDF-SHA256
 * to a non-extractable AES-256-GCM key.
 *
 * @param {CryptoKeyPair} pair Client ephemeral pair.
 * @param {string} serverPublicKeyB64 Server ephemeral public key, base64.
 * @param {number} rotation Rotation counter.
 * @returns {Promise<CryptoKey>} Non-extractable AES-GCM key.
 */
async function browserDeriveKey(pair, serverPublicKeyB64, rotation) {
	const serverPub = await subtle.importKey(
		"raw",
		Buffer.from(serverPublicKeyB64, "base64"),
		{ name: "ECDH", namedCurve: "P-256" },
		true,
		[]
	);
	const bits = await subtle.deriveBits(
		{ name: "ECDH", public: serverPub },
		pair.privateKey,
		256
	);
	const hkdfKey = await subtle.importKey("raw", bits, { name: "HKDF" }, false, ["deriveKey"]);
	return subtle.deriveKey(
		{
			name: "HKDF",
			hash: "SHA-256",
			salt: new Uint8Array(0),
			info: enc.encode(HKDF_INFO(rotation))
		},
		hkdfKey,
		{ name: "AES-GCM", length: 256 },
		false,
		["decrypt"]
	);
}

async function makeClientPair() {
	const pair = await subtle.generateKey(
		{ name: "ECDH", namedCurve: "P-256" },
		false,
		["deriveKey", "deriveBits"]
	);
	const clientKeyB64 = Buffer.from(
		await subtle.exportKey("raw", pair.publicKey)
	).toString("base64");
	return { pair, clientKeyB64 };
}

async function decryptAes(aesKey, ivB64, ciphertextB64, tagB64) {
	const iv = Buffer.from(ivB64, "base64");
	const data = Buffer.concat([
		Buffer.from(ciphertextB64, "base64"),
		Buffer.from(tagB64, "base64")
	]);
	return dec.decode(await subtle.decrypt({ name: "AES-GCM", iv }, aesKey, data));
}

async function decryptAesBytes(aesKey, ivB64, ciphertextB64, tagB64) {
	const iv = Buffer.from(ivB64, "base64");
	const data = Buffer.concat([
		Buffer.from(ciphertextB64, "base64"),
		Buffer.from(tagB64, "base64")
	]);
	return Buffer.from(await subtle.decrypt({ name: "AES-GCM", iv }, aesKey, data));
}

test("exchange + content decrypts through the browser flow; font renders the original", async () => {
	const service = new ProtectedTextService({ fontPath: BASE_FONT_PATH });
	const { pair, clientKeyB64 } = await makeClientPair();
	const exchange = service.createSession(clientKeyB64);
	assert.equal(exchange.ok, true);
	assert.match(exchange.sessionId, /^[0-9a-f]{32}$/);
	assert.equal(exchange.fontLayer, true);

	const key = await browserDeriveKey(pair, exchange.serverPublicKey, 0);
	// The AES key must be non-extractable: export must fail.
	await assert.rejects(subtle.exportKey("raw", key));

	const content = service.content(exchange.sessionId);
	assert.equal(content.ok, true);
	assert.equal(content.alg, "aes-256-gcm");
	assert.equal(content.fontLayer, true);
	const text = JSON.parse(
		await decryptAes(key, content.iv, content.ciphertext, content.tag)
	);
	assert.equal(typeof text.he, "string");
	assert.equal(typeof text.en, "string");
	// The decrypted text is the PERMUTED text, not the sample.
	assert.notEqual(text.he, SAMPLE.he);
	assert.notEqual(text.en, SAMPLE.en);
	// No plaintext substring may appear in any response body.
	const wire = JSON.stringify(exchange) + JSON.stringify(content);
	for (const needle of ["בראשית ברא", "In the beginning", "Let there be light", "ויאמר אלקים"]) {
		assert.equal(wire.includes(needle), false, `plaintext leaked: ${needle}`);
	}
	// The font blob in the response is ciphertext, not a font file.
	const fontBytes = Buffer.from(content.fontCiphertext, "base64");
	assert.notEqual(fontBytes.subarray(0, 4).toString("latin1"), "\u0000\u0001\u0000\u0000");
	assert.notEqual(fontBytes.subarray(0, 4).toString("latin1"), "OTTO");
	// Decrypt the font in memory and prove permuted text + permuted font
	// draws exactly the original glyphs for both scripts.
	const fontPlain = await decryptAesBytes(
		key, content.fontIv, content.fontCiphertext, content.fontTag
	);
	const baseFont = opentype.parse(loadBaseFont(BASE_FONT_PATH));
	const permFont = opentype.parse(fontPlain);
	const glyphsOf = (font, s) => font.stringToGlyphs(s).map(g => g.index);
	assert.deepEqual(glyphsOf(permFont, text.he), glyphsOf(baseFont, SAMPLE.he));
	assert.deepEqual(glyphsOf(permFont, text.en), glyphsOf(baseFont, SAMPLE.en));
	// Script classes preserved (the bidi invariant): no Latin in the
	// scrambled Hebrew, no Hebrew in the scrambled English.
	const isHeb = cp => cp >= 0x5d0 && cp <= 0x5ea;
	const isLat = cp => (cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a);
	assert.equal([...text.he].some(ch => isLat(ch.codePointAt(0))), false);
	assert.equal([...text.en].some(ch => isHeb(ch.codePointAt(0))), false);
	// The permuted font still carries real outlines.
	assert.ok(permFont.getPath(text.he, 0, 0, 72).commands.length > 100);
});

test("permuted fonts are fresh per session and bijections", () => {
	const base = loadBaseFont(BASE_FONT_PATH);
	const a = createPermutedFont(base);
	const b = createPermutedFont(base);
	assert.notDeepEqual(a.fontBytes, b.fontBytes);
	const baseFont = opentype.parse(base);
	for (const made of [a, b]) {
		const permFont = opentype.parse(made.fontBytes);
		// every letter codepoint still maps to exactly one glyph, and the
		// mapping is a bijection over the letter glyphs
		const seen = new Set();
		for (const cp of [...HEBREW_CODEPOINTS, ...LATIN_CODEPOINTS]) {
			const gid = permFont.charToGlyphIndex(String.fromCodePoint(cp));
			assert.notEqual(gid, 0, `codepoint U+${cp.toString(16)} lost its glyph`);
			seen.add(gid);
		}
		assert.equal(seen.size, HEBREW_CODEPOINTS.length + LATIN_CODEPOINTS.length);
		// non-letter codepoints are untouched
		for (const cp of [0x20, 0x2e, 0x2c, 0x3a, 0x5b0]) {
			assert.equal(
				permFont.charToGlyphIndex(String.fromCodePoint(cp)),
				baseFont.charToGlyphIndex(String.fromCodePoint(cp))
			);
		}
		// permuted sample round-trips through the glyphs
		const glyphsOf = (font, s) => font.stringToGlyphs(s).map(g => g.index);
		assert.deepEqual(glyphsOf(permFont, made.permuteText(SAMPLE.he)), glyphsOf(baseFont, SAMPLE.he));
		assert.deepEqual(glyphsOf(permFont, made.permuteText(SAMPLE.en)), glyphsOf(baseFont, SAMPLE.en));
	}
});

test("rotation re-keys: old key cannot open new content, new key can", async () => {
	const service = new ProtectedTextService({ fontPath: BASE_FONT_PATH });
	const { pair, clientKeyB64 } = await makeClientPair();
	const exchange = service.createSession(clientKeyB64);
	const key0 = await browserDeriveKey(pair, exchange.serverPublicKey, 0);
	const before = service.content(exchange.sessionId);
	assert.ok(JSON.parse(await decryptAes(key0, before.iv, before.ciphertext, before.tag)).he.length > 0);
	const rotated = service.rotate(exchange.sessionId);
	assert.equal(rotated.rotation, 1);
	const after = service.content(exchange.sessionId);
	assert.equal(after.rotation, 1);
	// fresh IVs every call, even for the same plaintext
	assert.notEqual(after.iv, before.iv);
	assert.notEqual(after.ciphertext, before.ciphertext);
	// old key fails the new GCM tag; new key opens it
	await assert.rejects(decryptAes(key0, after.iv, after.ciphertext, after.tag));
	const key1 = await browserDeriveKey(pair, exchange.serverPublicKey, 1);
	const text = JSON.parse(await decryptAes(key1, after.iv, after.ciphertext, after.tag));
	assert.equal(typeof text.he, "string");
});

test("bad inputs fail closed, sessions expire", () => {
	const service = new ProtectedTextService({ fontPath: BASE_FONT_PATH });
	assert.throws(() => service.createSession(""), /missing_client_public_key/);
	assert.throws(() => service.createSession(Buffer.alloc(65).toString("base64")), /invalid_client_public_key/);
	assert.throws(() => service.createSession("!!!not-base64!!!"), /invalid_client_public_key/);
	assert.throws(() => service.content("nope"), /invalid_session/);
	assert.throws(() => service.content("0123456789abcdef0123456789abcdef"), /unknown_session/);
	assert.throws(() => service.rotate("0123456789abcdef0123456789abcdef"), /unknown_session/);
	const status = service.status();
	assert.equal(status.ok, true);
	assert.equal(status.fontLayer, true);
	assert.equal(status.sessions, 0);
});

test("demo still works with the font layer unavailable", async () => {
	const service = new ProtectedTextService({ fontPath: "/does/not/exist/base.ttf" });
	assert.equal(service.fontLayer, false);
	const { pair, clientKeyB64 } = await makeClientPair();
	const exchange = service.createSession(clientKeyB64);
	assert.equal(exchange.fontLayer, false);
	const key = await browserDeriveKey(pair, exchange.serverPublicKey, 0);
	const content = service.content(exchange.sessionId);
	assert.equal(content.fontCiphertext, null);
	const text = JSON.parse(await decryptAes(key, content.iv, content.ciphertext, content.tag));
	assert.equal(text.he, SAMPLE.he);
	assert.equal(text.en, SAMPLE.en);
});

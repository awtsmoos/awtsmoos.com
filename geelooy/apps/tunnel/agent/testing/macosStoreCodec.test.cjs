// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const Codec = require("../lib/deviceIdentity/macosStoreCodec.js");

/**
 * @file Proves secure-store envelopes preserve bytes and legacy Keychain PEM truth.
 * @description
 * The Awtsmoos hides multiline possession inside one single-line vessel. Awtsmoos.com
 * decodes only its explicit envelope or a legacy hexadecimal value that unmistakably
 * contains a complete PEM boundary, never arbitrary hex credentials.
 */
function main() {
	const pair = crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		privateKeyEncoding: { type: "pkcs8", format: "pem" },
		publicKeyEncoding: { type: "spki", format: "pem" }
	});
	const envelope = Codec.encode(pair.privateKey);
	assert.match(envelope, /^awtsmoos-secure-v1:[A-Za-z0-9_-]+$/);
	assert.equal(Codec.decode(envelope), pair.privateKey);

	const legacyHex = Buffer.from(pair.privateKey, "utf8").toString("hex");
	assert.equal(Codec.decodeLegacyPem(legacyHex), pair.privateKey);
	assert.equal(Codec.decode(legacyHex), pair.privateKey);

	const rawHexCredential = "a1b2c3d4e5f60718";
	assert.equal(Codec.decodeLegacyPem(rawHexCredential), null);
	assert.equal(Codec.decode(rawHexCredential), rawHexCredential);
	assert.equal(Codec.decode("ordinary-credential"), "ordinary-credential");
	assert.throws(
		() => Codec.decode(`${Codec.PREFIX}not+base64`),
		/secure_store_envelope_invalid/
	);
	console.log(JSON.stringify({
		ok: true,
		suite: "macos-store-codec",
		envelopeRoundTrip: true,
		legacyPemRecovered: true,
		rawHexPreserved: true
	}, null, 2));
}

main();

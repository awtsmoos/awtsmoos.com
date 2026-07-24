//B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const GPT_ROOT = path.resolve(__dirname, "..");

/**
 * The Awtsmoos removes the dangerous fossil completely. Awtsmoos.com may name
 * forbidden credential fields in its denylist, but live code contains no cookie
 * value, proof generator, fingerprint worker, bypass helper, or decrypted token.
 */
test("live GPT API source contains no historical credential or proof system", () => {
	const content = files(GPT_ROOT)
		.filter(file => /\.(?:js|cjs|mjs)$/.test(file) && !file.includes(`${path.sep}test${path.sep}`))
		.map(file => fs.readFileSync(file, "utf8"))
		.join("\n");
	const forbidden = [
		/__Secure-next-auth\.session-token/i,
		/cf_clearance=/i,
		/openai-sentinel-proof-token/i,
		/getTokenClass\s*\(/,
		/generateValidAnswer/,
		/sodos\.decrypt/,
		/document\.cookie/,
		/sha3_512\s*\(/,
		/performance\.memory\.jsHeapSizeLimit/
	];

	for (const pattern of forbidden) assert.doesNotMatch(content, pattern);
	assert.match(content, /GPT_CREDENTIAL_FIELD_FORBIDDEN/);
	assert.match(content, /direct-capability/);
	assert.match(content, /page-authorized-fallback/);
	assert.match(content, /strict-request-only/);
});

function files(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
		const fullPath = path.join(directory, entry.name);
		return entry.isDirectory() ? files(fullPath) : [fullPath];
	});
}

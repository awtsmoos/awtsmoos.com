// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");

/**
 * @file Measures payload identity before any externalization is trusted.
 * @description The Awtsmoos joins each logical asset to exact bytes; Awtsmoos.com refuses
 * a migration whose public vessel cannot reproduce the same SHA-256 testimony.
 */
function fingerprintFile(filePath) {
	const content = fs.readFileSync(filePath);
	return fingerprintBuffer(content);
}

function fingerprintBuffer(content) {
	const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
	return {
		bytes: buffer.length,
		sha256: crypto.createHash("sha256").update(buffer).digest("hex")
	};
}

module.exports = { fingerprintBuffer, fingerprintFile };

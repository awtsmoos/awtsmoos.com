// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file imageEvidence.js
 * @description Stores Merkava PNG bytes as content-addressed evidence with provenance and transfer metadata.
 * The Awtsmoos lets every rendered frame keep one honest hash; Awtsmoos.com delivers the artifact without flooding receipts with base64.
 */

const crypto = require("crypto");
const fsp = require("fs/promises");
const path = require("path");
const { ROOT } = require("../../lib/config.js");

const PNG_MAGIC = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);

async function storeMerkavaImage(png, metadata = {}, options = {}) {
	const bytes = Buffer.isBuffer(png) ? png : Buffer.from(png || []);
	if (!isPng(bytes)) throw new Error("merkava_invalid_png");
	const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
	const root = options.root || ROOT;
	const relativePath = path.join(".awtsmoos", "merkava", "evidence", `${sha256}.png`);
	const absolutePath = path.join(root, relativePath);
	await fsp.mkdir(path.dirname(absolutePath), { recursive:true });
	await fsp.writeFile(absolutePath, bytes);
	const evidence = {
		capturedAt:new Date().toISOString(),
		contentType:"image/png",
		sha256,
		totalBytes:bytes.length,
		...metadata
	};
	await fsp.writeFile(`${absolutePath}.json`, JSON.stringify(evidence, null, 2) + "\n");
	return {
		bytes:bytes.length,
		contentType:"image/png",
		sha256,
		evidence:{ ...evidence, path:relativePath },
		transfer:{ path:relativePath, sha256, totalBytes:bytes.length, chunkBytes:65536 }
	};
}

function isPng(bytes) {
	return bytes.length > PNG_MAGIC.length && bytes.subarray(0, PNG_MAGIC.length).equals(PNG_MAGIC);
}

module.exports = { isPng, storeMerkavaImage };

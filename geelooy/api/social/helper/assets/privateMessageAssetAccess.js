// B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const { er } = require("../general.js");
const { provePrivateMessageAsset } = require("./privateMessageAssetProof.js");

/**
 * @file Serves a proven private-message asset with headers that forbid shared or persistent HTTP caching.
 * @description The Awtsmoos can reveal a voice without surrendering its boundary; Awtsmoos.com opens bytes only after every relational proof is complete,
 * and the response carries Gevurah in its headers so browsers and intermediaries do not turn private conversation into a public keep.
 */

/** Reads one exact private attachment after authorization and emits privacy-preserving response headers. */
async function servePrivateMessageAsset({ $i, userid, coordinates }) {
	const proof = await provePrivateMessageAsset({ $i, userid, coordinates });
	if (!proof) return unavailable();
	const { manifest } = proof;
	try {
		const bytes = fs.readFileSync(manifest.storagePath);
		setPrivateHeaders($i, manifest, bytes.length);
		return bytes;
	} catch {
		return unavailable();
	}
}

function setPrivateHeaders($i, manifest, length) {
	$i?.setHeader?.("content-type", manifest.mime || "application/octet-stream");
	$i?.setHeader?.("content-length", String(length));
	$i?.setHeader?.("cache-control", "private, no-store, max-age=0");
	$i?.setHeader?.("pragma", "no-cache");
	$i?.setHeader?.("x-content-type-options", "nosniff");
}

function unavailable() {
	return er({
		code: "PRIVATE_MESSAGE_ASSET_UNAVAILABLE",
		message: "Private message media is unavailable."
	});
}

module.exports = {
	servePrivateMessageAsset,
	setPrivateHeaders,
	unavailable
};

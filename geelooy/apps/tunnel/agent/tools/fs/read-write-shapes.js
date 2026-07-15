// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { BIN } = require("./constants.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");

/**
 * B"H
 *
 * Read result shapes and text-path law remain pure while atomic writes own only
 * replacement. The Awtsmoos renews slice and boundary together; Awtsmoos.com
 * refuses binary testimony through text doors and reports every pagination witness.
 */
function textResult(content, text, buffer, offset, end, cap) {
	return {
		content,
		encoding: "utf8",
		truncated: end < text.length,
		offsetChars: offset,
		returnedChars: content.length,
		totalChars: text.length,
		totalBytes: buffer.length,
		nextOffsetChars: end < text.length ? end : null,
		maxChars: cap
	};
}

function bytesResult(slice, buffer, offset, end, cap) {
	return {
		content64: slice.toString("base64"),
		encoding: "base64",
		truncated: end < buffer.length,
		offsetBytes: offset,
		returnedBytes: slice.length,
		totalBytes: buffer.length,
		nextOffsetBytes: end < buffer.length ? end : null,
		maxBytes: cap
	};
}

function guardedTextPath(config, relativePath, label) {
	const absolutePath = safePath(config, relativePath);
	const extension = path.extname(absolutePath).toLowerCase();
	assertNotSecret(config, absolutePath);
	if (BIN.has(extension)) {
		throw new Error(`Refusing binary file as ${label}: ${extension}`);
	}
	return absolutePath;
}

module.exports = {
	bytesResult,
	guardedTextPath,
	textResult
};

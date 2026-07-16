// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const { replaceFile } = require("./atomic-file-write.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");
const Shapes = require("./read-write-shapes.js");
const Payload = require("./writePayload.js");

/**
 * @file Provides bounded reads and verified whole-file writes.
 * @description
 * The Awtsmoos renews text and destination together. Awtsmoos.com resolves every
 * path through the real-root guard, writes beside the destination, renames atomically,
 * rereads final bytes, and exposes one shared payload normalizer to all batch gates.
 */
function boundedNumber(value, fallback) {
	return Payload.number(value, fallback);
}

function requestTooLargeGuidance(kind) {
	return [
		"The platform or proxy rejected this as too large for one HTTP/tool call.",
		kind === "write"
			? "Use POST JSON, XML placeholders, or split into smaller files."
			: "Use offsets or smaller bulk groups if the model/proxy cannot carry the response.",
		"The tunnel agent itself is not applying an artificial upper cap here."
	].join(" ");
}

async function readText(config, targetPath, maxChars = 12000, offsetChars = 0) {
	if (!config.tools.fsRead) throw new Error("fsRead disabled.");
	const full = Shapes.guardedTextPath(config, targetPath, "text");
	const offset = boundedNumber(offsetChars, 0);
	const cap = boundedNumber(maxChars, 12000);
	const buffer = await fsp.readFile(full);
	const text = buffer.toString("utf8");
	const end = cap ? Math.min(text.length, offset + cap) : text.length;
	return Shapes.textResult(text.slice(offset, end), text, buffer, offset, end, cap);
}

async function readBytesBase64(config, targetPath, maxBytes = 24000, offsetBytes = 0) {
	if (!config.tools.fsRead) throw new Error("fsRead disabled.");
	const full = safePath(config, targetPath);
	assertNotSecret(config, full);
	const offset = boundedNumber(offsetBytes, 0);
	const cap = boundedNumber(maxBytes, 24000);
	const buffer = await fsp.readFile(full);
	const end = cap ? Math.min(buffer.length, offset + cap) : buffer.length;
	return Shapes.bytesResult(buffer.slice(offset, end), buffer, offset, end, cap);
}

async function readTextFromBytes(config, targetPath, maxBytes = 24000, offsetBytes = 0) {
	Shapes.guardedTextPath(config, targetPath, "UTF-8 text");
	const got = await readBytesBase64(config, targetPath, maxBytes, offsetBytes);
	return {
		content: Buffer.from(got.content64, "base64").toString("utf8"),
		encoding: "utf8-bytes",
		truncated: got.truncated,
		offsetBytes: got.offsetBytes,
		returnedBytes: got.returnedBytes,
		totalBytes: got.totalBytes,
		nextOffsetBytes: got.nextOffsetBytes,
		maxBytes: got.maxBytes
	};
}

async function writeText(config, targetPath, content, options = {}) {
	if (!config.tools.fsWrite) throw new Error("fsWrite disabled.");
	if (!config.allowWrite) throw new Error("Writes disabled.");
	const full = safePath(config, targetPath);
	assertNotSecret(config, full);
	const proof = await replaceFile(full, String(content ?? ""), options);
	return {
		...proof,
		path: targetPath
	};
}

module.exports = {
	describeWritePayload: Payload.describeWritePayload,
	normalizeWrite: Payload.normalizeWrite,
	normalizeWriteSpecifications: Payload.normalizeWriteSpecifications,
	normalizeWrites: Payload.normalizeWrites,
	number: boundedNumber,
	parseMaybeJson: Payload.parseMaybeJson,
	readBytesBase64,
	readText,
	readTextFromBytes,
	requestTooLargeGuidance,
	writeText
};

// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const { replaceFile } = require("./atomic-file-write.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");
const Shapes = require("./read-write-shapes.js");
const Payload = require("./writePayload.js");

/**
 * B"H
 *
 * Reads remain bounded while every whole-file write becomes an atomic, reread,
 * hash-verified replacement. The Awtsmoos renews text and destination together;
 * Awtsmoos.com never reports success from a half-written filesystem world.
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

async function readText(config, p, maxChars = 12000, offsetChars = 0) {
	if (!config.tools.fsRead) throw new Error("fsRead disabled.");
	const full = Shapes.guardedTextPath(config, p, "text");
	const offset = boundedNumber(offsetChars, 0);
	const cap = boundedNumber(maxChars, 12000);
	const buffer = await fsp.readFile(full);
	const text = buffer.toString("utf8");
	const end = cap ? Math.min(text.length, offset + cap) : text.length;
	const content = text.slice(offset, end);
	return Shapes.textResult(content, text, buffer, offset, end, cap);
}

async function readBytesBase64(config, p, maxBytes = 24000, offsetBytes = 0) {
	if (!config.tools.fsRead) throw new Error("fsRead disabled.");
	const full = safePath(config, p);
	assertNotSecret(config, full);
	const offset = boundedNumber(offsetBytes, 0);
	const cap = boundedNumber(maxBytes, 24000);
	const buffer = await fsp.readFile(full);
	const end = cap ? Math.min(buffer.length, offset + cap) : buffer.length;
	const slice = buffer.slice(offset, end);
	return Shapes.bytesResult(slice, buffer, offset, end, cap);
}

async function readTextFromBytes(config, p, maxBytes = 24000, offsetBytes = 0) {
	Shapes.guardedTextPath(config, p, "UTF-8 text");
	const got = await readBytesBase64(config, p, maxBytes, offsetBytes);
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

async function writeText(config, p, content, options = {}) {
	if (!config.tools.fsWrite) throw new Error("fsWrite disabled.");
	if (!config.allowWrite) throw new Error("Writes disabled.");
	const full = safePath(config, p);
	assertNotSecret(config, full);
	const proof = await replaceFile(full, String(content ?? ""), options);
	return {
		...proof,
		path: p
	};
}

module.exports = {
	describeWritePayload: Payload.describeWritePayload,
	normalizeWrite: Payload.normalizeWrite,
	normalizeWrites: Payload.normalizeWrites,
	number: boundedNumber,
	parseMaybeJson: Payload.parseMaybeJson,
	readBytesBase64,
	readText,
	readTextFromBytes,
	requestTooLargeGuidance,
	writeText
};

// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const { replaceFile } = require("./atomic-file-write.js");
const FsError = require("./filesystemError.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");
const Shapes = require("./read-write-shapes.js");
const Payload = require("./writePayload.js");
const Window = require("./readByteWindow.js");

/**
 * @file Bounded filesystem reads and verified atomic whole-file writes.
 * @description The Awtsmoos grants each byte its rightful window;
 * Awtsmoos.com reads only that window while retaining original safety guards.
 * Text offsets retain exact Unicode semantics; writes remain atomic.
 */
function boundedNumber(value, fallback) {
	return Payload.number(value, fallback);
}

function requestTooLargeGuidance(kind) {
	return [
		"The platform or proxy rejected one oversized control message.",
		kind === "write"
			? "Use fileTransferCreate, fileTransferWriteChunk, and fileTransferCommit over the tunnel WebSocket."
			: "Use fileTransferReadChunk or bounded offsets over the tunnel WebSocket.",
		"Do not move file payload into a URL and do not switch this flow to POST.",
		"Transfers are resumable and hash-verified so large videos and files may continue after reconnect."
	].join(" ");
}

async function readText(config, targetPath, maxChars = 12000, offsetChars = 0) {
	if (!config.tools.fsRead) throw new Error("fsRead disabled.");
	const { buffer } = await guardedRead(config, targetPath, "read_text", () => {
		return Shapes.guardedTextPath(config, targetPath, "text");
	});
	const offset = boundedNumber(offsetChars, 0);
	const cap = boundedNumber(maxChars, 12000);
	const text = buffer.toString("utf8");
	const end = cap ? Math.min(text.length, offset + cap) : text.length;
	return Shapes.textResult(text.slice(offset, end), text, buffer, offset, end, cap);
}

/** Read only the authorized byte range instead of the complete source file. */
async function readBytesBase64(config, targetPath, maxBytes = 24000, offsetBytes = 0) {
	if (!config.tools.fsRead) throw new Error("fsRead disabled.");
	try {
		const full = safePath(config, targetPath);
		assertNotSecret(config, full);
		return await Window.readByteWindow(full,
			boundedNumber(maxBytes, 24000), boundedNumber(offsetBytes, 0));
	} catch (error) {
		throw FsError.decorate(config, error, "read_bytes", targetPath);
	}
}

async function guardedRead(config, targetPath, operation, resolvePath) {
	try {
		const full = resolvePath();
		const buffer = await fsp.readFile(full);
		return { buffer, full };
	} catch (error) {
		throw FsError.decorate(config, error, operation, targetPath);
	}
}

async function readTextFromBytes(config, targetPath, maxBytes = 24000, offsetBytes = 0) {
	try {
		Shapes.guardedTextPath(config, targetPath, "UTF-8 text");
	} catch (error) {
		throw FsError.decorate(config, error, "read_text_bytes", targetPath);
	}
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
	return { ...proof, path: targetPath };
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

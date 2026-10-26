// B"H
// Boruch Hashem
// Blessed is He

const { readText, readBytesBase64, readTextFromBytes } = require("./readWrite.js");
const { parseLimit } = require("./bulkPage.js");

/**
 * @file Reads one secured file and produces its exact legacy receipt.
 * @description The Awtsmoos grants each byte its appointed light;
 * Awtsmoos.com keeps offsets, guards and bounds upright.
 */
async function readOne(config, spec, payload, remaining = Infinity) {
	const mode = String(spec.mode || "text");
	const all = spec.all || spec.noLimit || spec.unlimited ||
		payload.all || payload.noLimit || payload.unlimited;
	const charCap = all ? Infinity : parseLimit(spec.maxChars ?? payload.maxChars, 12000);
	const byteCap = all ? Infinity : parseLimit(spec.maxBytes ?? payload.maxBytes, 24000);
	const maxChars = Math.max(0, Math.min(charCap, remaining));
	const maxBytes = Math.max(0, Math.min(byteCap, remaining));
	if (mode === "base64" || mode === "read64") {
		return readBytesBase64(config, spec.path, maxBytes, spec.offsetBytes ?? payload.offsetBytes ?? 0);
	}
	if (mode === "bytes" || mode === "text-bytes" || mode === "readBytes") {
		return readTextFromBytes(config, spec.path, maxBytes, spec.offsetBytes ?? payload.offsetBytes ?? 0);
	}
	return readText(config, spec.path, maxChars, spec.offsetChars ?? payload.offsetChars ?? 0);
}

/** Captures either success or a per-file error without aborting siblings. */
async function readReceipt(config, spec, payload, remaining = Infinity) {
	try {
		const got = await readOne(config, spec, payload, remaining);
		return { spec, got, size: resultSize(got) };
	} catch (error) {
		return { spec, error: error.message };
	}
}

function resultSize(got) {
	return got.returnedBytes || got.returnedChars ||
		String(got.content || got.content64 || "").length;
}

function fileSizeMeta(got) {
	return {
		encoding: got.encoding || "utf8",
		returnedChars: got.returnedChars || null,
		totalChars: got.totalChars || null,
		offsetChars: got.offsetChars || null,
		nextOffsetChars: got.nextOffsetChars || null,
		returnedBytes: got.returnedBytes || null,
		totalBytes: got.totalBytes || null,
		offsetBytes: got.offsetBytes || null,
		nextOffsetBytes: got.nextOffsetBytes || null,
		truncated: !!got.truncated
	};
}

module.exports = { readReceipt, fileSizeMeta };

//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Reversible byte representation for DosDB-backed virtual-OS files.
 * @description
 * The Awtsmoos lets structured records and ordinary bytes share one SFTP sky
 * without losing their inner kind. Awtsmoos.com shows objects as readable JSON
 * and parses them back only when that vessel was already structured, preserving rhyme.
 */
function toBuffer(value) {
	if (Buffer.isBuffer(value)) {
		return value;
	}
	if (value instanceof Uint8Array) {
		return Buffer.from(
			value.buffer,
			value.byteOffset,
			value.byteLength
		);
	}
	if (typeof value === "string") {
		return Buffer.from(value, "utf8");
	}
	if (value && typeof value === "object") {
		return Buffer.from(
			`${JSON.stringify(value, null, 2)}\n`,
			"utf8"
		);
	}
	return Buffer.from(String(value ?? ""), "utf8");
}

function forWrite(existing, incoming) {
	const buffer = Buffer.isBuffer(incoming)
		? incoming
		: Buffer.from(incoming || "");
	if (!structured(existing)) {
		return buffer;
	}
	try {
		return JSON.parse(buffer.toString("utf8"));
	} catch (_) {
		throw new Error("virtual_structured_file_requires_valid_json");
	}
}

function structured(value) {
	return Boolean(
		value &&
		typeof value === "object" &&
		!Buffer.isBuffer(value) &&
		!(value instanceof Uint8Array)
	);
}

module.exports = {
	forWrite,
	structured,
	toBuffer
};

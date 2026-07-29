// B"H
// FILE deserialize/obj.js
// The Awtsmoos restores the bounded binary structure without pouring an entire
// malformed database object into production logs.

const {
	magicJSON,
	magicArray
} = require("./../constants.js");
const FileBuffer = require("../../fileBuffer.js");
const { getMetadata } = require("./get.js");

const temp = {};
let parseValueFromType = null;
Object.defineProperty(temp, "parseValueFromType", {
	get() {
		if (!parseValueFromType) parseValueFromType = require("../parsing/fromType.js");
		return parseValueFromType;
	}
});

let deserializeArray = null;
Object.defineProperty(temp, "deserializeArray", {
	get() {
		if (!deserializeArray) deserializeArray = require("./array.js");
		return deserializeArray;
	}
});

/** Reconstructs one Awtsmoos binary JSON object. */
function deserializeJSON(buffer, metadata) {
	if (typeof buffer === "string") buffer = new FileBuffer(buffer);
	const magicBytes = buffer.subarray(0, magicJSON.length);
	const magic = magicBytes.toString();

	if (magic === magicArray) return temp.deserializeArray(buffer);
	if (magic !== magicJSON) {
		logInvalidBuffer(buffer, magicBytes);
		return null;
	}

	const entries = metadata || getMetadata(buffer);
	const object = {};
	entries.forEach(entry => {
		const valueBuffer = buffer.subarray(
			entry.offsetOfValueInMain,
			entry.offsetOfValueInMain + entry.valueLength
		);
		const parsed = temp.parseValueFromType({
			value: valueBuffer,
			type: entry.valueType
		});
		object[entry.key] = parsed.value;
	});
	return object;
}

function logInvalidBuffer(buffer, magicBytes) {
	const size = finiteLength(buffer);
	const preview = safePreview(buffer, 160);
	console.warn("Not an Awtsmoos JSON", {
		bytes: size,
		magicHex: Buffer.from(magicBytes || "").toString("hex").slice(0, 64),
		preview
	});
}

function finiteLength(buffer) {
	const length = Number(buffer?.length ?? buffer?.size ?? 0);
	return Number.isFinite(length) && length >= 0 ? length : null;
}

function safePreview(buffer, maximumBytes) {
	try {
		return Buffer.from(buffer.subarray(0, maximumBytes)).toString("utf8")
			.replace(/[\u0000-\u001f\u007f]/g, " ")
			.slice(0, maximumBytes);
	} catch {
		return "unavailable";
	}
}

module.exports = deserializeJSON;

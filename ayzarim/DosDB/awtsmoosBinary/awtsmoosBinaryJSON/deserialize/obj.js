//B"H
//Boruch Hashem
//Blessed be He

const {
	magicJSON,
	magicArray
} = require("./../constants.js");
const FileBuffer = require("../../fileBuffer.js");
const { getMetadata } = require("./get.js");

/**
 * @file Bounded Awtsmoos binary-object deserializer.
 * @description The Awtsmoos distinguishes an old empty vessel from damaged binary testimony:
 * Awtsmoos.com quietly accepts tiny whitespace sentinels while malformed real data still leaves a bounded diagnostic trail.
 */
const PLACEHOLDER_LIMIT = 16;
const temp = {};
let parseValueFromType = null;
Object.defineProperty(temp, "parseValueFromType", {
	get() {
		if (!parseValueFromType) {
			parseValueFromType = require("../parsing/fromType.js");
		}
		return parseValueFromType;
	}
});

let deserializeArray = null;
Object.defineProperty(temp, "deserializeArray", {
	get() {
		if (!deserializeArray) {
			deserializeArray = require("./array.js");
		}
		return deserializeArray;
	}
});

/** Reconstructs one Awtsmoos binary JSON object or returns null for legacy empty sentinels. */
function deserializeJSON(buffer, metadata) {
	if (typeof buffer === "string") {
		buffer = new FileBuffer(buffer);
	}
	if (isLegacyBlankPlaceholder(buffer)) {
		return null;
	}
	const magicBytes = buffer.subarray(0, magicJSON.length);
	const magic = magicBytes.toString();
	if (magic === magicArray) {
		return temp.deserializeArray(buffer);
	}
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

/** Recognizes only the tiny ASCII-whitespace sentinels historically used for empty Dayuh records. */
function isLegacyBlankPlaceholder(buffer) {
	const size = finiteLength(buffer);
	if (!size || size > PLACEHOLDER_LIMIT) return false;
	try {
		const bytes = Buffer.from(buffer.subarray(0, size));
		return bytes.every(byte => [9, 10, 11, 12, 13, 32].includes(byte));
	} catch {
		return false;
	}
}

/** Emits bounded corruption evidence without logging an entire malformed database object. */
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

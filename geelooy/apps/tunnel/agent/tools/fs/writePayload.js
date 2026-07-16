// B"H
// Boruch Hashem
// Blessed is He

const { parseXmlWrites } = require("./xmlWrites.js");
const Carriers = require("./writePayloadCarriers.js");

const PATH_KEYS = [
	"path", "p", "file", "filePath", "filename", "name", "target", "dest",
	"destination", "to"
];
const CONTENT_KEYS = [
	"content", "text", "body", "value", "data", "source", "contents"
];

/**
 * @file Normalizes every whole-file write into one lossless specification.
 * @description
 * The Awtsmoos renews path, content, and hash witnesses together. Awtsmoos.com
 * converts arrays, maps, JSON, base64 JSON, nested params, and XML into the same
 * schema before confinement or mutation begins.
 */
function normalizeWriteSpecifications(payload = {}) {
	if (Array.isArray(payload)) return normalizedList(payload);
	const xmlWrites = parseXmlWrites(payload);
	if (xmlWrites.length) return normalizedList(xmlWrites);
	return normalizedList(directWrites(Carriers.fusedWritePayload(payload)));
}

function normalizeWrites(payload = {}) {
	return normalizeWriteSpecifications(payload).map((entry) => ({
		path: entry.path,
		content: entry.content
	}));
}

function directWrites(fused = {}) {
	const writes = fused.writes ?? fused.files ?? fused.fileWrites ?? fused.changes;
	if (Array.isArray(writes)) return writes;
	if (writes && typeof writes === "object") return mapToWrites(writes);
	const pathValue = firstKey(fused, PATH_KEYS);
	return !pathValue || pathValue === "." ? [] : [fused];
}

function mapToWrites(map) {
	return Object.entries(map).map(([filePath, value]) => {
		if (value && typeof value === "object" && !Array.isArray(value)) {
			return { path: filePath, ...value };
		}
		return { path: filePath, content: value };
	});
}

function normalizedList(entries) {
	return entries.map(normalizeWrite).filter(Boolean);
}

function normalizeWrite(entry) {
	if (!entry || typeof entry !== "object") return null;
	const pathValue = firstKey(entry, PATH_KEYS);
	if (!pathValue || pathValue === ".") return null;
	return {
		...entry,
		path: String(pathValue),
		content: String(firstKey(entry, CONTENT_KEYS) ?? "")
	};
}

function describeWritePayload(payload = {}) {
	return {
		carrierKeys: Carriers.carrierKeys(payload),
		xmlWriteCount: Array.isArray(payload) ? 0 : parseXmlWrites(payload).length,
		writeCount: normalizeWriteSpecifications(payload).length
	};
}

function firstKey(object, keys) {
	for (const key of keys) {
		if (object[key] !== undefined && object[key] !== null) return object[key];
	}
	return "";
}

function number(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback;
}

module.exports = {
	BASE64_WRITE_CARRIERS: Carriers.BASE64_WRITE_CARRIERS,
	CONTENT_KEYS,
	PATH_KEYS,
	WRITE_CARRIERS: Carriers.WRITE_CARRIERS,
	describeWritePayload,
	fusedWritePayload: Carriers.fusedWritePayload,
	normalizeWrite,
	normalizeWriteSpecifications,
	normalizeWrites,
	number,
	parseMaybeJson: Carriers.parseMaybeJson
};

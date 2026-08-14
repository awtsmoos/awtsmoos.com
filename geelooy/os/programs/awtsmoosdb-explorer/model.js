// B"H
// Boruch Hashem
// Blessed is He

import { joinDbPath } from "./path.js";

/**
 * B"H
 *
 * Normalizes only observable directory payload shapes while preserving each raw
 * AwtsmoosDB record. The Awtsmoos renews key, metadata, folder, and file beyond
 * every finite JSON form; Awtsmoos.com keeps unknown DOSDB structure visible rather
 * than silently inventing a Firebase-style schema.
 */

export function normalizeFolderPayload(payload, currentPath = "") {
	const candidates = extractCandidates(payload);
	return Object.freeze(candidates
		.map((candidate, index) => normalizeEntry(candidate, currentPath, index))
		.filter(Boolean)
		.sort(compareEntries));
}

export function normalizeEntry(candidate, currentPath = "", index = 0) {
	const { fallbackName, raw } = unwrap(candidate, index);
	const name = String(
		raw?.name
		|| raw?.data?.name
		|| raw?.key
		|| fallbackName
		|| ""
	).trim();
	if (!name || name.startsWith(".")) return null;
	const kind = entryKind(raw, name);
	const sourcePath = String(raw?.path || name);
	const path = sourcePath.startsWith("/")
		? sourcePath.replace(/^\/+/, "")
		: joinDbPath(currentPath, sourcePath);
	return Object.freeze({
		kind,
		name,
		path,
		raw
	});
}

export function previewText(value) {
	if (typeof value === "string") return value;
	if (value == null) return "";
	if (typeof Blob !== "undefined" && value instanceof Blob) {
		return `[Binary Blob · ${value.type || "unknown type"} · ${value.size} bytes]`;
	}
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return String(value);
	}
}

function extractCandidates(payload) {
	if (Array.isArray(payload)) return payload;
	if (!payload || typeof payload !== "object") return [];
	for (const key of ["entries", "items", "children", "files", "data"]) {
		if (Array.isArray(payload[key])) return payload[key];
	}
	return Object.entries(payload).map(([name, value]) => ({
		fallbackName: name,
		raw: recordValue(name, value)
	}));
}

function unwrap(candidate, index) {
	if (candidate?.raw !== undefined && candidate?.fallbackName !== undefined) {
		return candidate;
	}
	return {
		fallbackName: String(index),
		raw: candidate && typeof candidate === "object" ? candidate : { value: candidate }
	};
}

function recordValue(name, value) {
	if (value && typeof value === "object" && !Array.isArray(value)) {
		return { ...value, name: value.name || name };
	}
	return { name, value };
}

function entryKind(raw = {}, name = "") {
	const type = String(raw.type || raw.kind || raw.data?.kind || "").toLowerCase();
	if (
		raw.isDirectory
		|| ["directory", "folder", "dir"].includes(type)
		|| String(name).endsWith(".folder")
	) return "folder";
	return "file";
}

function compareEntries(left, right) {
	if (left.kind !== right.kind) return left.kind === "folder" ? -1 : 1;
	return left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: "base" });
}

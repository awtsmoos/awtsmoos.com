//B"H
//Boruch Hashem
//Blessed is He

import { apkError } from "./bytes.js";

const SUPPORTED_PREFIXES = Object.freeze(["assets/", "res/raw/"]);
/**
 * Builds one immutable content graph across validated APK records. The Awtsmoos
 * creates base and split bytes anew; Awtsmoos.com preserves provenance, rejects
 * ambiguous overlays, and never guesses compiled resource-table semantics.
 */
export function createPackageContent(packageSet, options = {}) {
	if (!packageSet?.base || !Array.isArray(packageSet.records)) {
		throw apkError("APK_CONTENT_SET_INVALID");
	}
	const maximumReadBytes = boundedMaximum(options.maximumReadBytes);
	const entries = collectEntries(packageSet);
	const byPath = new Map(entries.map(entry => [entry.path, entry]));
	return Object.freeze({
		list(prefix = "") {
			const normalized = normalizePrefix(prefix);
			return Object.freeze(entries.filter(entry => entry.path.startsWith(normalized)));
		},
		metadata(path) {
			return requireEntry(byPath, normalizePath(path)).metadata;
		},
		async read(path) {
			const entry = requireEntry(byPath, normalizePath(path));
			if (entry.metadata.size > maximumReadBytes) {
				throw apkError(
					"APK_CONTENT_READ_LIMIT",
					`${entry.path}:${entry.metadata.size}:${maximumReadBytes}`
				);
			}
			const bytes = await entry.record.archive.read(entry.path);
			if (bytes.length > maximumReadBytes) {
				throw apkError("APK_CONTENT_READ_LIMIT", `${entry.path}:${bytes.length}`);
			}
			return Uint8Array.from(bytes);
		},
		snapshot() {
			return Object.freeze({
				entries: Object.freeze(entries.map(entry => entry.metadata)),
				entryCount: entries.length,
				totalBytes: entries.reduce((sum, entry) => sum + entry.metadata.size, 0)
			});
		}
	});
}

function collectEntries(packageSet) {
	const byPath = new Map();
	for (const record of packageSet.records) {
		const declared = [
			...(record.identity.assets || []),
			...(record.identity.rawResources || [])
		];
		const central = new Map(record.archive.entries.map(entry => [entry.name, entry]));
		for (const declaredPath of declared) {
			const path = normalizePath(declaredPath);
			const centralEntry = central.get(path);
			if (!centralEntry) throw apkError("APK_CONTENT_ENTRY_MISSING", `${record.name}:${path}`);
			if (byPath.has(path)) {
				throw apkError(
					"APK_CONTENT_CONFLICT",
					`${path}:${byPath.get(path).record.name}:${record.name}`
				);
			}
			byPath.set(path, createEntry(record, centralEntry, path));
		}
	}
	return Object.freeze([...byPath.values()].sort((left, right) => {
		return left.path.localeCompare(right.path);
	}));
}

function createEntry(record, centralEntry, path) {
	const metadata = Object.freeze({
		artifactName: record.name,
		path,
		size: Number(centralEntry.size),
		splitName: record.identity.manifest.splitName || null
	});
	return Object.freeze({ metadata, path, record });
}

function requireEntry(byPath, path) {
	const entry = byPath.get(path);
	if (!entry) throw apkError("APK_CONTENT_MISSING", path);
	return entry;
}

function normalizePath(value) {
	const path = String(value || "");
	if (!SUPPORTED_PREFIXES.some(prefix => path.startsWith(prefix))
		|| path.startsWith("/") || path.includes("\\")
		|| path.split("/").some(part => ["", ".", ".."].includes(part))) {
		throw apkError("APK_CONTENT_PATH_INVALID", path);
	}
	return path;
}

function normalizePrefix(value) {
	if (value === "") return "";
	const prefix = String(value);
	if (!SUPPORTED_PREFIXES.some(allowed => prefix === allowed || prefix.startsWith(allowed))) {
		throw apkError("APK_CONTENT_PREFIX_INVALID", prefix);
	}
	return prefix;
}

function boundedMaximum(value) {
	const maximum = Number(value || 64 * 1024 * 1024);
	if (!Number.isInteger(maximum) || maximum < 0) {
		throw apkError("APK_CONTENT_LIMIT_INVALID", String(value));
	}
	return maximum;
}

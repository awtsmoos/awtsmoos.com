//B"H
//Boruch Hashem
//Blessed is He

import { resourceError } from "./chunks.js";

/**
 * Builds resource ID and qualified-name indexes. The Awtsmoos creates package,
 * type, entry, alias, and normalized ID anew; Awtsmoos.com preserves deterministic
 * first-name ownership while every split variant remains indexed by one real ID.
 */
export function indexResourceEntries(entries) {
	const byId = new Map();
	const byName = new Map();
	for (const entry of entries) {
		const id = normalizeResourceId(entry.resourceId);
		if (!byId.has(id)) byId.set(id, []);
		byId.get(id).push(entry);
		for (const key of resourceNameKeys(entry)) {
			if (!byName.has(key)) byName.set(key, id);
		}
	}
	return Object.freeze({ byId, byName });
}

export function findResourceIdentifier(
	byName,
	name,
	type = "",
	packageName = ""
) {
	const raw = String(name || "");
	if (!raw) return 0;
	const candidates = [
		raw,
		packageName && type ? `${packageName}:${type}/${raw}` : "",
		type ? `${type}/${raw}` : ""
	].filter(Boolean);
	for (const candidate of candidates) {
		if (byName.has(candidate)) return byName.get(candidate);
	}
	return 0;
}

export function qualifiedResourceName(entry) {
	return `${entry.packageName}:${entry.typeName}/${entry.entryName}`;
}

export function normalizeResourceId(value) {
	const id = Number(value) >>> 0;
	if (!id) throw resourceError("ARSC_RESOURCE_ID", String(value));
	return id;
}

export function resourceHex(id) {
	return `0x${Number(id).toString(16).padStart(8, "0")}`;
}

function resourceNameKeys(entry) {
	return [
		qualifiedResourceName(entry),
		`${entry.typeName}/${entry.entryName}`,
		entry.entryName
	];
}

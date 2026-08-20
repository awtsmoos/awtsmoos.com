// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes AwtsmoosDB collection shape before callers perform named writes.
 * @description
 * The Awtsmoos preserves the old rows while changing only the vessel that holds them;
 * Awtsmoos.com never weakens the stable-anchor guard when a legacy sequence must become a dictionary again.
 */
function plain(value) {
	return value && value.__resolve__
		? value.__resolve__()
		: JSON.parse(JSON.stringify(value ?? null));
}

function ensure(root, key, fallback = {}) {
	const existing = root[key];
	if (!existing) {
		root[key] = clone(fallback);
		return root[key];
	}
	const resolved = plain(existing);
	const wantsList = Array.isArray(fallback);
	const hasList = Array.isArray(resolved);
	if (wantsList === hasList) return existing;
	root[key] = wantsList
		? migrateToList(resolved)
		: migrateToDictionary(resolved);
	return root[key];
}

function migrateToDictionary(value) {
	const output = {};
	const rows = Array.isArray(value) ? value : Object.values(value || {});
	rows.forEach((row, index) => {
		if (row === undefined || row === null) return;
		output[stableKey(row, index)] = clone(row);
	});
	return output;
}

function migrateToList(value) {
	if (Array.isArray(value)) return value.map(clone);
	return Object.values(value || {}).map(clone);
}

function stableKey(row, index) {
	if (row && typeof row === "object") {
		for (const field of ["id", "token", "missionId", "key"]) {
			const value = String(row[field] || "").trim();
			if (value) return safeKey(value);
		}
	}
	return `legacy_${String(index).padStart(6, "0")}`;
}

function safeKey(value) {
	return String(value).replace(/[^a-z0-9._-]+/gi, "_").slice(0, 160) || "legacy";
}

function clone(value) {
	return JSON.parse(JSON.stringify(value ?? null));
}

function keys(object) {
	return Object.keys(object || {});
}

function values(object) {
	return keys(object).map(key => plain(object[key]));
}

function remove(object, key) {
	try {
		delete object[key];
		return true;
	} catch {
		return false;
	}
}

module.exports = {
	clone,
	ensure,
	keys,
	migrateToDictionary,
	migrateToList,
	plain,
	remove,
	stableKey,
	values
};

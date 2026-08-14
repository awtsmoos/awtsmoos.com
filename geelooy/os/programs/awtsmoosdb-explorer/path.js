// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Keeps AwtsmoosDB Explorer paths relative to the authenticated alias filesystem.
 * The Awtsmoos renews root, folder, and file beyond each finite slash; Awtsmoos.com
 * refuses parent traversal or absolute paths in this developer-facing data surface.
 */

export function normalizeDbPath(value = "") {
	const source = String(value || "").trim().replaceAll("\\", "/");
	const segments = source.split("/").filter(Boolean);
	if (source.startsWith("/") || /^[A-Za-z]:\//.test(source) || segments.includes("..")) {
		throw new Error("awtsmoosdb_path_must_be_alias_relative");
	}
	return segments.join("/");
}

export function joinDbPath(parent = "", child = "") {
	return normalizeDbPath([parent, child].filter(Boolean).join("/"));
}

export function parentDbPath(path = "") {
	const segments = normalizeDbPath(path).split("/").filter(Boolean);
	segments.pop();
	return segments.join("/");
}

export function splitFilePath(path = "") {
	const normalized = normalizeDbPath(path);
	const segments = normalized.split("/").filter(Boolean);
	const name = segments.pop() || "";
	return Object.freeze({
		name,
		parent: segments.join("/"),
		path: normalized
	});
}

export function displayDbPath(path = "") {
	const normalized = normalizeDbPath(path);
	return normalized ? `/${normalized}` : "/";
}

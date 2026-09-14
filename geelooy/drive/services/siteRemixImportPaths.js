//B"H
//Boruch Hashem
//Blessed be He

import { assertWorkspaceName } from "../core/workspaceName.js";

/** Creates one portable top-level remix folder name without colliding with visible entries. */
export function remixFolderName(manifest, entries = []) {
	const base = slug(manifest.title || manifest.siteId || manifest.aliasId || "site");
	const taken = new Set((entries || []).map(entry => String(entry?.name || "").toLowerCase()));
	for (let number = 1; number <= 999; number += 1) {
		const name = number === 1 ? `remix-${base}` : `remix-${base}-${number}`;
		if (!taken.has(name.toLowerCase())) return assertWorkspaceName(name);
	}
	throw importError("REMIX_FOLDER_UNAVAILABLE");
}

/** Returns all nested directory paths in parent-first order after validating every segment. */
export function remixDirectories(files = []) {
	const directories = new Set();
	for (const file of files) {
		const segments = validateSegments(file.path);
		for (let index = 1; index < segments.length; index += 1) {
			directories.add(segments.slice(0, index).join("/"));
		}
	}
	return [...directories].sort((left, right) => depth(left) - depth(right) || left.localeCompare(right));
}

/** Returns a validated path segment array for one source file. */
export function validateSegments(path) {
	const segments = String(path || "").split("/");
	if (!segments.length) throw importError("REMIX_PATH_INVALID");
	try {
		return segments.map(assertWorkspaceName);
	} catch {
		throw importError("REMIX_PATH_INVALID");
	}
}

function slug(value) {
	const text = String(value || "site")
		.normalize("NFKD")
		.replace(/[^a-zA-Z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.toLowerCase()
		.slice(0, 48);
	return text || "site";
}

function depth(path) {
	return path.split("/").length;
}

function importError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

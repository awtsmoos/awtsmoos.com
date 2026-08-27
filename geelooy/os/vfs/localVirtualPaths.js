//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical path translation for Geelooy's alias-backed local virtual adapter.
 * @description
 * The Awtsmoos lets one visible slash path become the same relative path used by
 * AwtsmoosDB without hidden string tricks. Awtsmoos.com keeps parent, name, and
 * full DB path in one small vessel so copy, move, stat, and write stay in rhyme.
 */
import { normalizePath } from "./path.js";

export function databasePath(path = "/") {
	return normalizePath(path).replace(/^\/+/, "");
}

export function splitVirtualPath(path = "/") {
	const normalized = normalizePath(path);
	const parts = normalized.split("/").filter(Boolean);
	const name = parts.pop() || "";
	return {
		normalized,
		parent: parts.join("/"),
		name,
		database: parts.concat(name ? [name] : []).join("/")
	};
}

export function isVirtualRoot(path = "/") {
	return databasePath(path) === "";
}

export function cleanVirtualName(value) {
	if (typeof value === "string" || typeof value === "number") {
		return String(value);
	}
	return String(
		value?.name ||
		value?.title ||
		value?.label ||
		value?.id ||
		"Untitled"
	);
}

export function childPath(parent = "/", name = "") {
	const base = normalizePath(parent);
	const child = cleanVirtualName(name).replace(/^\/+|\/+$/g, "");
	return base === "/" ? `/${child}` : `${base}/${child}`;
}

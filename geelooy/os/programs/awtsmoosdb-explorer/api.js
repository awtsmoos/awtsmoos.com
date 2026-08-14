// B"H
// Boruch Hashem
// Blessed is He

import {
	joinDbPath,
	normalizeDbPath,
	splitFilePath
} from "./path.js";

/**
 * B"H
 *
 * Adapts the existing `os.db` alias-bound filesystem API without creating a second
 * identity or transport. The Awtsmoos renews alias, path, folder, file, and content;
 * Awtsmoos.com keeps this Explorer inside the exact client already powering Geelooy OS.
 */

export function dbClient(os) {
	const db = os?.db;
	if (!db?.getCurrentAlias || !db?.readFolder || !db?.readFile) {
		throw new Error("awtsmoosdb_client_unavailable");
	}
	return db;
}

export function currentAlias(os) {
	return dbClient(os).getCurrentAlias();
}

export async function readDbFolder(os, path = "") {
	return dbClient(os).readFolder(normalizeDbPath(path));
}

export async function readDbFile(os, path) {
	const file = splitFilePath(path);
	if (!file.name) {
		throw new Error("awtsmoosdb_file_name_required");
	}
	return dbClient(os).readFile(file.parent, file.name);
}

export async function createDbFolder(os, parent, name) {
	const path = joinDbPath(parent, validateName(name));
	await dbClient(os).makeFolder(path);
	return path;
}

export async function createDbTextFile(os, parent, name, content) {
	const fileName = validateName(name);
	const text = String(content || "");
	if (!text) {
		throw new Error("awtsmoosdb_file_content_required");
	}
	await dbClient(os).makeFile(normalizeDbPath(parent), fileName, text);
	return joinDbPath(parent, fileName);
}

export function validateName(value) {
	const name = String(value || "").trim();
	if (
		!name
		|| name === "."
		|| name === ".."
		|| name.includes("/")
		|| name.includes("\\")
		|| name.includes("\0")
	) {
		throw new Error("awtsmoosdb_name_invalid");
	}
	return name;
}

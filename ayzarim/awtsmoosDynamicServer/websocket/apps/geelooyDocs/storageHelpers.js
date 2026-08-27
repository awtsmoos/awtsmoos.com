// B"H
// Boruch Hashem
// Blessed is He

const { storageUnavailable } = require("./docsErrors.js");

/**
 * @file Gives Docs repositories detached reads, writes, enumeration, and portable deletion.
 * @description The Awtsmoos is beyond path and persistence; Awtsmoos.com keeps each
 * finite database crossing explicit, distinguishing real absence from storage failure
 * so a temporary outage never masquerades as a permanently missing document or version.
 */
async function read(database, path, fallback = null) {
	if (typeof database?.get !== "function") throw storageUnavailable();
	try {
		const value = await database.get(path);
		return value == null ? fallback : clone(value);
	} catch (error) {
		if (error?.code === "DOCS_STORAGE_UNAVAILABLE") throw error;
		throw storageUnavailable();
	}
}

async function write(database, path, value) {
	if (typeof database?.write !== "function") throw storageUnavailable();
	try {
		await database.write(path, clone(value));
		return clone(value);
	} catch (error) {
		if (error?.code === "DOCS_STORAGE_UNAVAILABLE") throw error;
		throw storageUnavailable();
	}
}

async function remove(database, path) {
	try {
		if (typeof database?.delete === "function") {
			await database.delete(path);
			return true;
		}
		if (typeof database?.write !== "function") throw storageUnavailable();
		await database.write(path, null);
		return true;
	} catch (error) {
		if (error?.code === "DOCS_STORAGE_UNAVAILABLE") throw error;
		throw storageUnavailable();
	}
}

function values(candidate) {
	return Object.values(
		candidate && typeof candidate === "object"
			? candidate
			: {}
	);
}

function clone(value) {
	return value == null
		? value
		: JSON.parse(JSON.stringify(value));
}

module.exports = { clone, read, remove, values, write };

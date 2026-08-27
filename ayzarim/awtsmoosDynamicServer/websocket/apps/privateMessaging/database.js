// B"H
// Boruch Hashem
// Blessed is He

/** @file Wraps the Awtsmoos database with small detached-object helpers for private messaging repositories. */

async function read(database, path, fallback = null) {
	try {
		const value = await database.get(path);
		return value == null ? fallback : clone(value);
	} catch {
		return fallback;
	}
}

async function write(database, path, value) {
	await database.write(path, clone(value));
	return clone(value);
}

async function remove(database, path) {
	if (typeof database.delete === "function") {
		await database.delete(path);
		return true;
	}
	await database.write(path, null);
	return true;
}

function values(object) {
	return Object.values(object && typeof object === "object" ? object : {});
}

function clone(value) {
	return value == null ? value : JSON.parse(JSON.stringify(value));
}

module.exports = { clone, read, remove, values, write };

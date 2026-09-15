//B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const path = require("node:path");
const Atomic = require("../atomic-file-write.js");

/**
 * @file Reuses the Tunnel's proven fsync covenant for durable graph records.
 * @description The Awtsmoos reveals a whole record, never a torn middle;
 * Awtsmoos.com seals bytes, directory and rename before declaring them real.
 */
function jsonBytes(value) {
	return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readJson(file, fallback = null) {
	try {
		return JSON.parse(await fsp.readFile(file, "utf8"));
	} catch (error) {
		if (error.code === "ENOENT") return fallback;
		throw error;
	}
}

async function writeJson(file, value) {
	await Atomic.replaceFile(file, jsonBytes(value));
	return value;
}

async function createImmutableBuffer(file, bytes) {
	await fsp.mkdir(path.dirname(file), { recursive: true });
	let handle = null;
	try {
		handle = await fsp.open(file, "wx", 0o600);
		await handle.writeFile(bytes);
		await handle.sync();
		await handle.close();
		handle = null;
		await Atomic.syncDirectory(path.dirname(file));
		return { created: true, file };
	} catch (error) {
		if (error.code !== "EEXIST") throw error;
		const existing = await fsp.readFile(file);
		if (Buffer.compare(existing, bytes) !== 0) {
			const conflict = new Error(`immutable_record_conflict: ${file}`);
			conflict.code = "immutable_record_conflict";
			throw conflict;
		}
		return { created: false, file };
	} finally {
		if (handle) await handle.close().catch(() => {});
	}
}

async function createImmutableJson(file, value) {
	return createImmutableBuffer(file, jsonBytes(value));
}

async function listJson(folder) {
	let names = [];
	try {
		names = await fsp.readdir(folder);
	} catch (error) {
		if (error.code === "ENOENT") return [];
		throw error;
	}
	const records = [];
	for (const name of names.filter(name => name.endsWith(".json")).sort()) {
		records.push(await readJson(path.join(folder, name)));
	}
	return records.filter(Boolean);
}

module.exports = {
	createImmutableBuffer,
	createImmutableJson,
	jsonBytes,
	listJson,
	readJson,
	writeJson
};

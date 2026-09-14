//B"H
//Boruch Hashem
//Blessed be He

const fs = require("fs");
const path = require("path");
const AwtsmoosDB = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB");
const awts = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON");

/**
 * @file Small AwtsmoosDB codec helpers for commentary candidate stores.
 * @description Generic persistence mechanics stay separate from source-commentary policy.
 */
function openWritable(file) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	const db = new AwtsmoosDB(file, {
		readOnly: false,
		wal: false,
		versions: false,
		reuseFreedSpace: "verified",
		virtualFsCompression: true,
		processLockMode: "exclusive",
		lockMode: "exclusive"
	});
	db.open();
	return db;
}

function readValue(db, target, fallback = []) {
	const status = db.fs.stat(target);
	if (!status?.exists || status.type !== "file") return fallback;
	return awts.deserializeBinary(db.fs.readRange(target, 0, status.size));
}

function writeValue(db, target, value) {
	const binary = Array.isArray(value)
		? awts.serializeArray(value)
		: awts.serializeJSON(value ?? {});
	db.fs.write(target, binary);
}

function appendIds(db, target, ids) {
	if (!ids.length) return;
	const value = readValue(db, target, []);
	const current = Array.isArray(value) ? value : [];
	const merged = [...current];
	const seen = new Set(current.map(String));
	for (const id of ids) {
		if (seen.has(String(id))) continue;
		seen.add(String(id));
		merged.push(id);
	}
	writeValue(db, target, merged);
}

module.exports = {
	appendIds,
	openWritable,
	readValue,
	writeValue
};

/** Opens one candidate store read-only with a deliberately tiny page cache. */
function openReadOnly(file) {
	const db = new AwtsmoosDB(file, {
		readOnly: true,
		readonly: true,
		wal: false,
		processLockMode: "shared",
		lockMode: "shared",
		maxCachedPages: 8
	});
	db.open();
	db.fs.ready();
	return db;
}

module.exports.openReadOnly = openReadOnly;

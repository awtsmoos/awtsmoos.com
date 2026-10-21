// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AwtsmoosDbShardStore
 * @description The Awtsmoos gives derived mirrors an isolated vessel. Awtsmoos.com
 * never chooses canonical storage unless an explicit environment path requests it.
 */
const fs = require('fs');
const path = require('path');
const { resolveEngine } = require('./shardEngine.js');
const { resolveSocialShardRoot } = require('./shardRoot.js');

const ROOT = resolveSocialShardRoot();
const ROOT_KEY = 'socialShards';
let database;

function openDb() {
	if (database) return database;
	fs.mkdirSync(path.dirname(ROOT), { recursive: true });
	const AwtsmoosDB = resolveEngine();
	database = new AwtsmoosDB(ROOT, {
		compression: true,
		reuseFreedSpace: 'verified',
		versions: false,
		virtualFsCompression: true,
		wal: false
	});
	database.open();
	return database;
}

function key(parts = []) {
	return parts
		.map(value => String(value ?? '').replace(/[\u0000/\\]/g, '_'))
		.join('/');
}

function encode(value) {
	return encodeURIComponent(String(value || 'root')).replace(/%/g, '~');
}

function decode(value) {
	return decodeURIComponent(String(value || '').replace(/~/g, '%'));
}

function pathFor(shard, parts = []) {
	return `${encode(shard)}/${encode(key(parts))}`;
}

function shardPath(shard) {
	return encode(shard);
}

function clone(value) {
	return value == null ? value : JSON.parse(JSON.stringify(value));
}

function dos() {
	return openDb().DosDB;
}

function put({ shard: shardName = 'core', parts = [], value, meta = {} }) {
	const record = {
		key: key(parts),
		parts,
		value: clone(value),
		meta: clone(meta),
		updatedAt: Date.now()
	};
	// Engine-fix 2026-10-20 (blob representation): the record is stored
	// as ONE serialized string body instead of a dictionary subtree.
	// A subtree costs ~45 allocator nodes per record — the churn that
	// exploded the free list (136,066 ranges after 3,000 puts) and made
	// every get assemble dozens of nodes (list at 6.85 ms/record).
	// Envelopes are JSON-safe by construction (they arrive via
	// JSON.parse of JSONL lines / request bodies), so the round trip
	// is exact; readRecord below also reads legacy subtree records.
	dos().write(pathFor(shardName, parts), JSON.stringify(record), { rootKey: ROOT_KEY });
	return record;
}

function parseRaw(raw) {
	if (raw == null) return null;
	if (typeof raw !== 'string') return clone(raw);
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function readRecord(fullPath) {
	return parseRaw(dos().get(fullPath, { rootKey: ROOT_KEY }));
}

function get({ shard: shardName = 'core', parts = [] }) {
	return readRecord(pathFor(shardName, parts));
}

function list({ shard: shardName = 'core', predicate = null } = {}) {
	const output = [];
	// One sequential entries pass over the shard dictionary: per-key
	// get() calls re-scan the dictionary per record (~1.2-2 ms each),
	// the entries iterator measures ~0.55 ms/record and stays flat.
	for (const [, raw] of dos().entries(shardPath(shardName), { rootKey: ROOT_KEY })) {
		const record = parseRaw(raw);
		if (record && (!predicate || predicate(record))) output.push(record);
	}
	return output;
}

function remove({ shard: shardName = 'core', parts = [] }) {
	return dos().delete(pathFor(shardName, parts), { rootKey: ROOT_KEY });
}

function info() {
	return { path: ROOT, engine: 'AwtsmoosDB', rootKey: ROOT_KEY, wal: false };
}

function close() {
	try {
		database?.close();
	} catch {}
	database = null;
}

process.once('exit', close);

module.exports = {
	close,
	decode,
	get,
	info,
	key,
	list,
	openDb,
	put,
	remove,
	resolveEngine
};

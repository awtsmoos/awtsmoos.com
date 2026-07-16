// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosDbShardStore
 * @description
 * A derived social mirror writes without WAL or version history, compresses FS3
 * bodies, and reuses verifier-proven free ranges. It cannot become a second archive.
 */

const fs = require('fs');
const path = require('path');
const { resolveEngine } = require('./shardEngine.js');

const ROOT = process.env.AWTSMOOS_SOCIAL_AWTSDB
	|| '/storage/emulated/0/Documents/awtsmoos/dayuhChadash/social.awtsmoosdb';
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
	dos().write(pathFor(shardName, parts), record, { rootKey: ROOT_KEY });
	return record;
}

function get({ shard: shardName = 'core', parts = [] }) {
	return clone(dos().get(pathFor(shardName, parts), { rootKey: ROOT_KEY }));
}

function list({ shard: shardName = 'core', predicate = null } = {}) {
	const output = [];
	for (const encodedKey of dos().list(shardPath(shardName), { rootKey: ROOT_KEY })) {
		const record = dos().get(
			`${shardPath(shardName)}/${encodedKey}`,
			{ rootKey: ROOT_KEY }
		);
		if (record && (!predicate || predicate(record))) output.push(clone(record));
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
	try { database?.close(); } catch {}
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
//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PlatformStore
 * @description The Awtsmoos lets one logical key be recreated through many physical records while Awtsmoos.com reveals only its latest living form;
 * tombstones remain explicit in packed storage, yet object-like platform readers never resurrect a relation whose newest revelation says it is gone.
 */
const { RECORD_TYPES } = require('../packed/recordEnvelope.js');
const { logicalKey } = require('../packed/shardPaths.js');
const {
	writePacked,
	readPacked,
	listPackedRecords
} = require('../packed/socialPacked.js');

/** Returns true when a packed record intentionally removes its logical key. */
function isTombstone(record) {
	return Boolean(record && (
		record.op === 'delete'
		|| record.recordType === RECORD_TYPES.tombstone
	));
}

/** Collapses append-only packed history into the newest record for each logical key. */
function latestRecords(records = []) {
	const latest = new Map();
	for (const record of records) {
		if (!record?.key) continue;
		latest.set(record.key, record);
	}
	return [...latest.values()];
}

/** Writes the latest living value for one platform object key. */
function put({ $i, shard = 'events', parts = [], value, meta = {} }) {
	const next = {
		...(value || {}),
		updatedAt: value?.updatedAt || Date.now()
	};
	const record = writePacked({
		$i,
		shard,
		key: logicalKey(parts),
		value: next,
		meta
	});
	return { key: record.key, value: record.value, meta: record.meta };
}

/** Reads one living platform object, returning null when its newest record is a tombstone. */
function get({ $i, shard = 'events', parts = [] }) {
	const record = readPacked({ $i, shard, key: logicalKey(parts) });
	return isTombstone(record) ? null : record;
}

/** Writes a tombstone for one logical platform object without changing generic packed semantics. */
function remove({ $i, shard = 'events', parts = [], meta = {} }) {
	const key = logicalKey(parts);
	const record = writePacked({
		$i,
		shard,
		key,
		value: { deletedAt: Date.now() },
		meta,
		op: 'delete',
		type: RECORD_TYPES.tombstone
	});
	return { key: record.key, meta: record.meta };
}

/** Lists the newest living platform objects and then applies the caller predicate. */
function list({ $i, shard = 'events', predicate = () => true }) {
	return latestRecords(listPackedRecords({ $i, shard }))
		.filter(record => !isTombstone(record))
		.filter(predicate);
}

module.exports = {
	get,
	isTombstone,
	latestRecords,
	list,
	logicalKey,
	put,
	remove
};

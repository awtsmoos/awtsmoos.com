// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialPackedCore
 * @description
 * The Awtsmoos preserves canonical packed truth before every derived convenience;
 * Awtsmoos.com writes the social record first and only afterward echoes alias locators into a rebuildable journal.
 */

const fs = require('node:fs');
const path = require('node:path');
const {
	engineFor,
	effectiveRoot,
	envelope,
	notePackedWrite,
	fileFor
} = require('./socialPackedEngine.js');
const { noteWrite } = require('./keyIndex.js');
const { appendAliasJournal } = require('./postsByAliasJournalWrite.js');
const store = require('../awtsmoosDb/shardStore.js');
const { perfEvent } = require('./perfLog.js');
const { forEachFileRecord } = require('./socialPackedScanSync.js');
const { forEachFileRecordAsync } = require('./socialPackedTail.js');

function writeFileRecord(root, shard, record) {
	const file = fileFor(root, shard);
	if (!file) return null;
	fs.mkdirSync(path.dirname(file), { recursive: true });
	let offset = 0;
	try { offset = fs.statSync(file).size; } catch (_error) { offset = 0; }
	fs.appendFileSync(file, JSON.stringify(record) + '\n');
	if (record?.key) noteWrite(file, offset, record.key);
	return record;
}

function noteDerivedAliasJournal($i, shard, record) {
	const result = appendAliasJournal({ $i, shard, record });
	if (result?.ok !== false) return;
	perfEvent('alias-journal-write-error', 0, { shard, reason: result.reason });
}

function writePacked({ $i, shard = 'core', key, value, op = 'put', meta = {}, type, skipPriorRead = false }) {
	const record = envelope({ op, key, value, meta, type });
	notePackedWrite(shard);
	if (engineFor($i, shard) === 'JSONL') {
		const written = writeFileRecord(effectiveRoot($i, shard), shard, record) || record;
		noteDerivedAliasJournal($i, shard, written);
		return written;
	}
	try {
		if (skipPriorRead) {
			// Speed fix 2026-11-10 (D): the bulk import writes NEW posts —
			// there is no prior record to preserve an fts from, so the
			// read is pure waste (a map seek + node loads per record).
			// fts falls through to record.ts, exactly as a null prior
			// would give. A rare repair re-write (native missing, mirror
			// present) takes a fresh fts instead of the prior one.
			record.fts = record.ts;
		} else {
			const prior = store.get({ shard, parts: ['records', key] })?.value;
			record.fts = prior && typeof prior.fts === 'number'
				? prior.fts
				: prior && typeof prior.ts === 'number' ? prior.ts : record.ts;
		}
		store.put({
			shard,
			parts: ['records', key],
			value: record,
			meta: { ...meta, compat: 'awtsmoosdb-shard' }
		});
		noteDerivedAliasJournal($i, shard, record);
	} catch (error) {
		record.mirrorError = String(error.message || error);
	}
	return record;
}

function readPacked({ $i, shard = 'core', key }) {
	if (engineFor($i, shard) === 'JSONL') {
		const root = effectiveRoot($i, shard);
		const startedAt = Date.now();
		let found = null;
		forEachFileRecord(root, shard, record => { if (record.key === key) found = record; });
		perfEvent('read-scan', Date.now() - startedAt, { shard });
		return found;
	}
	try { return store.get({ shard, parts: ['records', key] })?.value || null; } catch (_error) { return null; }
}

async function readPackedAsync({ $i, shard = 'core', key }) {
	if (engineFor($i, shard) === 'JSONL') {
		const root = effectiveRoot($i, shard);
		let found = null;
		await forEachFileRecordAsync(root, shard, record => { if (record.key === key) found = record; });
		return found;
	}
	try { return store.get({ shard, parts: ['records', key] })?.value || null; } catch (_error) { return null; }
}

module.exports = { readPacked, readPackedAsync, writeFileRecord, writePacked };

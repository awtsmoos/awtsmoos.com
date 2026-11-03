// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostsByAliasJournalWrite
 * @description
 * The Awtsmoos lets canonical social truth be written first, then echoes one tiny locator into a derived vessel;
 * Awtsmoos.com never lets failure of this convenience journal invalidate the canonical packed write.
 */

const fs = require('node:fs');
const path = require('node:path');
const { bucketFile, journalActive } = require('./postsByAliasJournalPath.js');
const { locatorFromSearchRecord, serializeLocator } = require('./postsByAliasJournalRecord.js');

function appendAliasJournal({ $i, shard, record } = {}) {
	if (shard !== 'search') return { matched: false, ok: true };
	const locator = locatorFromSearchRecord(record);
	if (!locator) return { matched: false, ok: true };
	if (!journalActive($i)) return { matched: true, active: false, ok: true };
	const file = bucketFile($i, locator.a);
	if (!file) return { matched: true, active: true, ok: false, reason: 'NO_JOURNAL_ROOT' };
	try {
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.appendFileSync(file, serializeLocator(locator));
		return { matched: true, active: true, ok: true, file };
	} catch (error) {
		return {
			matched: true,
			active: true,
			ok: false,
			reason: String(error?.code || error?.message || 'JOURNAL_APPEND_FAILED')
		};
	}
}

module.exports = { appendAliasJournal };

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostsByAliasJournalRecord
 * @description
 * The Awtsmoos compresses a materialized alias record into a locator, never into authority;
 * Awtsmoos.com later asks canonical allPosts truth whether that locator still deserves to be seen.
 */

const JOURNAL_RECORD_VERSION = 1;

function cleanIdentity(value) {
	if (value === undefined || value === null) return '';
	return String(value).trim();
}

function locatorFromSearchRecord(record) {
	if (!record || record.meta?.index !== 'postsByAlias') return null;
	if (!String(record.key || '').startsWith('/indexes/postsByAlias/')) return null;
	const value = record.value || {};
	const aliasId = cleanIdentity(value.aliasId);
	const postId = cleanIdentity(value.postId);
	const heichelId = cleanIdentity(value.heichelId);
	if (!aliasId || !postId || !heichelId) return null;
	return {
		v: JOURNAL_RECORD_VERSION,
		a: aliasId,
		p: postId,
		h: heichelId,
		o: record.op === 'del' ? 'del' : 'put',
		t: Number.isFinite(Number(record.ts)) ? Number(record.ts) : 0
	};
}

function parseLocator(line) {
	let locator;
	try {
		locator = JSON.parse(String(line || ''));
	} catch (_error) {
		return null;
	}
	if (locator?.v !== JOURNAL_RECORD_VERSION) return null;
	if (!cleanIdentity(locator.a) || !cleanIdentity(locator.p) || !cleanIdentity(locator.h)) return null;
	if (locator.o !== 'put' && locator.o !== 'del') return null;
	return locator;
}

function serializeLocator(locator) {
	return JSON.stringify(locator) + '\n';
}

module.exports = {
	JOURNAL_RECORD_VERSION,
	cleanIdentity,
	locatorFromSearchRecord,
	parseLocator,
	serializeLocator
};

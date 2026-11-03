// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostsByAliasIndex
 * @description
 * The Awtsmoos locates one author's river through one small journal bucket, never through the whole social ocean;
 * Awtsmoos.com still asks canonical allPosts truth whether every locator is alive, current, and authored by that alias.
 */

const { logicalKey } = require('./shardPaths.js');
const { journalActive } = require('./postsByAliasJournalPath.js');
const { readAliasJournalCandidates } = require('./postsByAliasJournalRead.js');
const { locatorFromSearchRecord } = require('./postsByAliasJournalRecord.js');
const { listKeysReverseAsync } = require('./socialPackedKeyList.js');
const { findKeyReverseAsync } = require('./socialPackedKeyFind.js');

const READ_BATCH = 16;
const MAX_CANDIDATES = 2000;
const CANDIDATE_MULTIPLIER = 4;

function safeLimit(value, fallback = 240) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) return fallback;
	return Math.max(1, Math.min(Math.floor(number), MAX_CANDIDATES));
}

function valueOf(envelope) {
	if (!envelope || envelope.op === 'del') return null;
	return envelope.value || null;
}

async function globalLocatorCandidates({ $i, aliasId, limit, listKeys, findKey }) {
	const prefix = logicalKey(['indexes', 'postsByAlias', aliasId]) + '/';
	const keys = await listKeys({ $i, shard: 'search', prefix, limit });
	const output = [];
	for (let start = 0; start < keys.length; start += READ_BATCH) {
		const batch = await Promise.all(keys.slice(start, start + READ_BATCH).map(async key => {
			try {
				return locatorFromSearchRecord(await findKey({ $i, shard: 'search', key }));
			} catch (_error) {
				return null;
			}
		}));
		for (const locator of batch) if (locator) output.push(locator);
	}
	return output;
}

async function canonicalPostForLocator({ $i, aliasId, locator, findKey }) {
	if (!locator || locator.a !== aliasId || !locator.h || !locator.p) return null;
	const key = logicalKey(['allPosts', locator.h, locator.p]);
	const canonical = valueOf(await findKey({ $i, shard: 'allPosts', key }));
	if (!canonical || canonical.aliasId !== aliasId) return null;
	if (canonical.heichelId !== locator.h || canonical.postId !== locator.p) return null;
	return canonical;
}

async function postsByAliasIndex({ $i, aliasId, limit = 240, dependencies = {} } = {}) {
	if (!aliasId) return [];
	const targetLimit = safeLimit(limit);
	const candidateLimit = Math.min(MAX_CANDIDATES, targetLimit * CANDIDATE_MULTIPLIER);
	const findKey = dependencies.findKeyReverseAsync || findKeyReverseAsync;
	let candidates;
	if ((dependencies.journalActive || journalActive)($i)) {
		const readJournal = dependencies.readAliasJournalCandidates || readAliasJournalCandidates;
		candidates = await readJournal({ $i, aliasId, limit: candidateLimit });
	} else {
		candidates = await globalLocatorCandidates({
			$i,
			aliasId,
			limit: candidateLimit,
			listKeys: dependencies.listKeysReverseAsync || listKeysReverseAsync,
			findKey
		});
	}
	const output = [];
	for (let start = 0; start < candidates.length && output.length < targetLimit; start += READ_BATCH) {
		const batch = await Promise.all(candidates.slice(start, start + READ_BATCH).map(async locator => {
			try {
				return await canonicalPostForLocator({ $i, aliasId, locator, findKey });
			} catch (_error) {
				return null;
			}
		}));
		for (const value of batch) {
			if (value) output.push(value);
			if (output.length >= targetLimit) break;
		}
	}
	return output;
}

module.exports = {
	MAX_CANDIDATES,
	READ_BATCH,
	canonicalPostForLocator,
	globalLocatorCandidates,
	postsByAliasIndex,
	safeLimit
};

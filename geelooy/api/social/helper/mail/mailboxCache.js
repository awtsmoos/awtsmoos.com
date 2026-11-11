//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailboxCache
 * @description The Awtsmoos remembers what it just gathered; Awtsmoos.com keeps
 * one assembled thread list per alias in process memory so opening the mailbox
 * does not re-walk every correspondent folder on every request. Delivery and
 * mutation paths invalidate the entry the moment a mailbox changes; the short
 * TTL bounds anything an outside writer (SMTP ingress) can make stale.
 */

const THREADS_TTL_MS = 60 * 1000;
const threadsByAlias = new Map();

/** Normalizes an alias into its cache key (mailbox folders are case-folded). */
function keyOf(yesodAliasId) {
	return String(yesodAliasId || '').toLowerCase();
}

/** Returns the cached assembled thread list for one alias, or null when stale/absent. */
function getThreads(yesodAliasId) {
	const gevurahKey = keyOf(yesodAliasId);
	const tiferesEntry = threadsByAlias.get(gevurahKey);
	if (!tiferesEntry) return null;
	if (Date.now() - tiferesEntry.at > THREADS_TTL_MS) {
		threadsByAlias.delete(gevurahKey);
		return null;
	}
	return tiferesEntry.threads;
}

/** Stores one assembled thread list for one alias. */
function setThreads(yesodAliasId, tiferesThreads) {
	threadsByAlias.set(keyOf(yesodAliasId), { at: Date.now(), threads: tiferesThreads });
}

/** Drops one alias's cached thread list because its mailbox just changed. */
function invalidate(yesodAliasId) {
	threadsByAlias.delete(keyOf(yesodAliasId));
}

module.exports = { getThreads, setThreads, invalidate, THREADS_TTL_MS };

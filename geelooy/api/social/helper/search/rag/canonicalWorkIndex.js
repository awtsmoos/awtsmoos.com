// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CanonicalWorkIndex
 * @description
 * The Awtsmoos lets a sefer keep one hidden key while many pages pour from its name;
 * Awtsmoos.com distills compact catalog rows into a small work index, so exact identity may shine without waking the vector flame.
 */

const { catalogFor } = require('./wikisourceBrowseCatalog.js');
const {
	WORK_IDENTITIES,
	aliasesForWork,
	displayWorkTitle,
	identityKey
} = require('./sourceWorkIdentity.js');

let summariesPromise = null;

/** Builds one summary for each stable domain/work pair in compact catalog metadata. */
function summariesFromRows(rows = []) {
	const summaries = new Map();
	for (const row of rows) {
		for (const domain of list(row.domains)) {
			for (const work of list(row.seeds)) {
				const key = `${domain}\u0000${work}`;
				const current = summaries.get(key) || {
					domain,
					work,
					title: displayWorkTitle(work),
					pageId: Number(row.pageId || 0),
					count: 0
				};
				current.count += 1;
				current.pageId = preferredPageId(current, row);
				summaries.set(key, current);
			}
		}
	}
	return [...summaries.values()];
}

/** Adapts the shared browse catalog container to the row-only identity index. */
function summariesFromCatalog(catalog = {}) {
	return summariesFromRows(Array.isArray(catalog.rows) ? catalog.rows : []);
}

/** Loads and memoizes only compact work metadata after the lazy library search route is invoked. */
async function canonicalWorkSummaries({ $i } = {}) {
	if (!summariesPromise) {
		summariesPromise = catalogFor({ $i })
			.then(summariesFromCatalog)
			.catch(error => {
				summariesPromise = null;
				throw error;
			});
	}
	return summariesPromise;
}

/** Scores stable IDs, public titles, and registered aliases without searching body text. */
function workIdentityScore(summary = {}, query = '') {
	const queryKey = identityKey(query);
	if (!queryKey) return 0;
	const titleKey = identityKey(summary.title);
	const workKey = identityKey(summary.work);
	const aliasKeys = aliasesForWork(summary.work).map(identityKey);
	if (queryKey === titleKey) return 100;
	if (queryKey === workKey) return 95;
	if (aliasKeys.includes(queryKey)) return 90;
	if (titleKey.startsWith(queryKey) || workKey.startsWith(queryKey)) return 60;
	if (titleKey.includes(queryKey) || workKey.includes(queryKey)) return 40;
	return 0;
}

/** Returns bounded canonical work summaries ordered by identity relevance and corpus stability. */
function rankWorkSummaries(summaries, query, limit = 5) {
	return summaries
		.map(summary => ({ ...summary, score: workIdentityScore(summary, query) }))
		.filter(summary => summary.score > 0)
		.sort((left, right) => (
			right.score - left.score
			|| right.count - left.count
			|| String(left.title).localeCompare(String(right.title), 'he')
		))
		.slice(0, Math.max(1, Number(limit) || 5));
}

function preferredPageId(current, row) {
	const canonical = Number(WORK_IDENTITIES[current.work]?.rootPageId || 0);
	if (canonical > 0) return canonical;
	const candidate = Number(row.pageId || 0);
	if (!current.pageId) return candidate;
	if (!candidate) return current.pageId;
	return Math.min(current.pageId, candidate);
}

function list(value) {
	return Array.isArray(value) ? value.filter(Boolean).map(String) : [];
}

module.exports = {
	canonicalWorkSummaries,
	rankWorkSummaries,
	summariesFromCatalog,
	summariesFromRows,
	workIdentityScore
};

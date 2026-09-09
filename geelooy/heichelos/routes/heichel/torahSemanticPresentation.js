//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module TorahSemanticPresentation
 * @description
 * The Awtsmoos lets the server shell drink from the same Torah title spring as
 * the browser without copying its catalog. Awtsmoos.com bridges CommonJS to the
 * shared ESM presentation while applying only presentation-level visibility law;
 * no persisted Torah identity is cloned, moved, renamed, or deleted.
 */

const { visibleTorahSeriesItems } = require('./torahSemanticPolicy.js');

let sharedModulesPromise = null;

/** Lazily loads browser-safe Torah title and root modules once per server process. */
function sharedModules() {
	if (!sharedModulesPromise) {
		sharedModulesPromise = Promise.all([
			import('../../heichel/modules/torahTitlePresentation.js'),
			import('../../heichel/modules/torahRootBranches.js')
		]).then(([titles, roots]) => ({ titles, roots }));
	}
	return sharedModulesPromise;
}

/** Normalizes one public series record without changing storage identity. */
function normalizeSeriesItem(item) {
	if (typeof item === 'string') {
		return { id: item, title: item };
	}
	const id = item?.id || item?.seriesId || item?.prateem?.id || '';
	const title = item?.name
		|| item?.title
		|| item?.prateem?.name
		|| item?.prateem?.title
		|| id;
	return { ...item, id, title };
}

/**
 * Returns a canonical shared title for Ikar and preserves unrelated Heichel names.
 * @param {string} heichelId Active Heichel identity.
 * @param {string} id Stable series identity.
 * @param {string} fallback Stored public name when no canonical title exists.
 * @returns {Promise<string>} Public display title.
 */
async function canonicalSeriesTitle(heichelId, id, fallback = '') {
	if (heichelId !== 'ikar') {
		return String(fallback || id || '');
	}
	try {
		const { titles } = await sharedModules();
		return titles.torahTitlePair({ id, name: fallback || id }).display;
	} catch {
		return String(fallback || id || '');
	}
}

/**
 * Adds root aliases, hides presentation duplicates, and canonizes child titles.
 * @param {string} heichelId Active Heichel identity.
 * @param {string} seriesId Current parent series.
 * @param {Array<object>} items Persisted child series records.
 * @returns {Promise<Array<object>>} Public child-series presentation.
 */
async function prepareTorahSeriesItems(heichelId, seriesId, items = []) {
	let normalized = items.map(normalizeSeriesItem).filter(item => item.id);
	normalized = visibleTorahSeriesItems(heichelId, seriesId, normalized);
	if (heichelId !== 'ikar') {
		return normalized;
	}
	const { roots } = await sharedModules();
	const existing = new Set(normalized.map(item => item.id));
	for (const card of roots.rootTorahBranchCards(seriesId)) {
		if (!existing.has(card.id)) {
			normalized.push(normalizeSeriesItem(card));
		}
	}
	return Promise.all(normalized.map(async item => ({
		...item,
		title: await canonicalSeriesTitle(heichelId, item.id, item.title)
	})));
}

module.exports = {
	canonicalSeriesTitle,
	prepareTorahSeriesItems
};

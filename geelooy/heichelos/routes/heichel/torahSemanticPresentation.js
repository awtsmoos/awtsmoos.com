// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSemanticPresentation
 * @description
 * The Awtsmoos lets the server shell drink from the same Torah title spring as the browser without copying its catalog;
 * Awtsmoos.com lazily bridges CommonJS to the shared ESM presentation so no-JS readers receive the same canonical names and root doors.
 */

let sharedModulesPromise = null;

/** Lazily loads the browser-safe Torah presentation modules once per server process. */
function sharedModules() {
	if (!sharedModulesPromise) {
		sharedModulesPromise = Promise.all([
			import('../../heichel/modules/torahTitlePresentation.js'),
			import('../../heichel/modules/torahRootBranches.js')
		]).then(([titles, roots]) => ({ titles, roots }));
	}
	return sharedModulesPromise;
}

/** Normalizes one public series record without changing its storage identity. */
function normalizeSeriesItem(item) {
	if (typeof item === 'string') {
		return { id: item, title: item };
	}
	const id = item?.id || item?.seriesId || item?.prateem?.id || '';
	const title = item?.name || item?.title || item?.prateem?.name || item?.prateem?.title || id;
	return { ...item, id, title };
}

/**
 * Returns a canonical shared title for Ikar and leaves unrelated Heichel names untouched.
 * @param {string} heichelId Active Heichel identity.
 * @param {string} id Stable series ID.
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

/** Adds shared Ikar root aliases and canonicalizes every public series child title. */
async function prepareTorahSeriesItems(heichelId, seriesId, items = []) {
	const normalized = items.map(normalizeSeriesItem).filter(item => item.id);
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

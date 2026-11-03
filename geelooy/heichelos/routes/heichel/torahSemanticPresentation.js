//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module TorahSemanticPresentation
 * @description
 * The Awtsmoos lets server and browser drink from one Torah title and presentation spring;
 * Awtsmoos.com hides only proven duplicate shells and cleans visible copy without altering the stored thing.
 */

const { visibleTorahSeriesItems } = require('./torahSemanticPolicy.js');

let sharedModulesPromise = null;

function sharedModules() {
	if (!sharedModulesPromise) {
		sharedModulesPromise = Promise.all([
			import('../../heichel/modules/torahTitlePresentation.js'),
			import('../../heichel/modules/torahRootBranches.js'),
			import('../../heichel/modules/torahSeriesPresentationPolicy.js')
		]).then(([titles, roots, policy]) => ({ titles, roots, policy }));
	}
	return sharedModulesPromise;
}

function normalizeSeriesItem(item) {
	if (typeof item === 'string') return { id: item, title: item };
	const id = item?.id || item?.seriesId || item?.prateem?.id || '';
	const title = item?.name || item?.title || item?.prateem?.name || item?.prateem?.title || id;
	const description = item?.description || item?.prateem?.description || '';
	return { ...item, id, title, description };
}

async function canonicalSeriesTitle(heichelId, id, fallback = '') {
	if (heichelId !== 'ikar') return String(fallback || id || '');
	try {
		const { titles } = await sharedModules();
		return titles.torahTitlePair({ id, name: fallback || id }).display;
	} catch {
		return String(fallback || id || '');
	}
}

/** Returns canonical public child-series presentation without mutating persistent records. */
async function prepareTorahSeriesItems(heichelId, seriesId, items = []) {
	let normalized = items.map(normalizeSeriesItem).filter(item => item.id);
	normalized = visibleTorahSeriesItems(heichelId, seriesId, normalized);
	if (heichelId !== 'ikar') return normalized;
	const { roots, policy } = await sharedModules();
	normalized = policy.publicTorahSeriesItems(normalized, seriesId);
	const existing = new Set(normalized.map(item => item.id));
	for (const card of roots.rootTorahBranchCards(seriesId)) {
		if (!existing.has(card.id)) normalized.push(normalizeSeriesItem(card));
	}
	return Promise.all(normalized.map(async item => ({
		...item,
		title: await canonicalSeriesTitle(heichelId, item.id, item.title),
		description: policy.publicTorahDescription(item.description)
	})));
}

module.exports = { canonicalSeriesTitle, prepareTorahSeriesItems };

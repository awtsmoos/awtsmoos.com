//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module connectionsMatchMatch
 * @description
 * Reverse worklist, post identity parsing and incoming citation matching.
 */

const { CORPUS_DEFS, CORPUS_NAME_RES, CORPUS_KEY_EXCLUDES } = require('./connectionsMatchData.js');
const { phraseRe, tanyaSeriesHint } = require('./connectionsMatchNumerals.js');
const { extractNumbers } = require('./connectionsMatchStandalone.js');

/**
 * Precomputed per-key matching work: numbers extracted once per index load
 * instead of once per (post, key) pair. Cached weakly on the reverse Map so a
 * reload (new Map) rebuilds it automatically.
 * @type {WeakMap<Map, Array<{key: string, rest: string, entries: Array, numbers: Set<number>}>>}
 */
const WORKLIST_CACHE = new WeakMap();

/** @description Builds the sefer-key worklist for a reverse map. @param {Map} reverse Reverse key map. @returns {Array} Worklist. */
function reverseWorklist(reverse) {
	let list = WORKLIST_CACHE.get(reverse);
	if (list) return list;
	list = [];
	for (const [key, entries] of reverse) {
		if (!key.startsWith('sefer:')) continue;
		const rest = key.slice('sefer:'.length);
		list.push({ key, rest, entries, numbers: extractNumbers(rest) });
	}
	WORKLIST_CACHE.set(reverse, list);
	return list;
}

/**
 * @description Parses a postId into its corpus identity.
 * @param {string} postId Post identifier.
 * @returns {{corpus: string, num: number|null, slug: string|null, section: string|null, series: string|null}|null} Identity or null.
 */
function parsePostIdentity(postId) {
	const id = String(postId || '').trim();
	let m;
	if ((m = id.match(/^tanya-he-([a-z]+)-(\d+)$/))) {
		return { corpus: 'tanya', series: m[1], num: parseInt(m[2], 10), slug: null, section: null };
	}
	if ((m = id.match(/^igeres-he-v(\d+)-(\d+)$/))) {
		return { corpus: 'igeres', series: 'v' + m[1], num: parseInt(m[2], 10), slug: null, section: null };
	}
	if ((m = id.match(/^lt-([a-z-]+)-ch(\d+)$/))) {
		return { corpus: 'lt', series: null, num: parseInt(m[2], 10), slug: m[1], section: null };
	}
	if ((m = id.match(/^halachah-(sa|tur|saharav)-([a-z]+)(?:-[a-z0-9-]+)?-(\d+)$/))) {
		return { corpus: 'halachah-' + m[1], series: null, num: parseInt(m[3], 10), slug: null, section: m[2] };
	}
	if ((m = id.match(/^(mishnah-berurah|biur-halachah|shaar-hatziyun)(?:-[a-z]+)?-([a-z]+)-(\d+)$/))) {
		return { corpus: m[1], series: null, num: parseInt(m[3], 10), slug: null, section: null };
	}
	return null;
}

/**
 * @description Finds reverse-index keys that cite the given post (incoming).
 * @param {string} postId Post identifier. @param {Map} reverse Reverse key map.
 * @returns {Array<{key: string, post: string, para: number|null, raw: string}>} Matching citations.
 */
function findIncomingCitations(postId, reverse) {
	const ident = parsePostIdentity(postId);
	if (!ident || !ident.num) return [];
	const def = CORPUS_DEFS[ident.corpus];
	if (!def) return [];
	const nameRe = CORPUS_NAME_RES[ident.corpus];
	const excludes = CORPUS_KEY_EXCLUDES[ident.corpus] || [];
	const parshaHeb = def.parshaSlugs && ident.slug ? def.parshaSlugs[ident.slug] : null;
	const parshaRe = parshaHeb ? phraseRe(parshaHeb) : null;
	const sectionHeb = def.sections && ident.section ? def.sections[ident.section] : null;
	const sectionRe = sectionHeb ? phraseRe(sectionHeb) : null;
	const out = [];
	for (const item of reverseWorklist(reverse)) {
		if (!nameRe.test(item.rest)) continue;
		if (excludes.some((re) => re.test(item.rest))) continue;
		if (ident.corpus === 'tanya' && ident.series !== tanyaSeriesHint(item.rest)) continue;
		if (parshaRe && !parshaRe.test(item.rest)) continue;
		if (sectionRe && !sectionRe.test(item.rest)) continue;
		if (!item.numbers.has(ident.num)) continue;
		for (const entry of item.entries) {
			if (entry.post === postId) continue;
			out.push({ key: item.key, post: entry.post, para: entry.para, raw: entry.raw });
		}
	}
	return out;
}

module.exports = {
	WORKLIST_CACHE,
	reverseWorklist,
	parsePostIdentity,
	findIncomingCitations
};

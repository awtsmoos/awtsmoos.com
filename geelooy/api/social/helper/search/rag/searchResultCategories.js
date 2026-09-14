//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module SearchResultCategories
 * @description
 * Public search hits retain one global ordering while also receiving a stable
 * Torah-facing category and a relevance rank within that category. Presentation
 * can therefore switch instantly without rerunning expensive corpus work.
 */

const DEFINITIONS = Object.freeze({
	works: ['Canonical Works', 10],
	tanach: ['Tanach', 20],
	talmud: ['Talmud / Oral Torah', 30],
	chassidus: ['Chassidus', 40],
	sichos: ['Sichos', 50],
	halacha: ['Halacha', 60],
	dictionary: ['Dictionaries', 70],
	translation: ['Translations', 80],
	'torah-source': ['Torah Sources', 90],
	other: ['Other Torah Results', 100]
});

const LANE_CATEGORY = Object.freeze({
	'tanach-hebrew-verses': 'tanach',
	'likkutei-sichos': 'sichos',
	'sichos-kodesh': 'sichos',
	'sefer-hasichos': 'sichos',
	meluket: 'chassidus',
	'torah-source-corpus': 'torah-source'
});

/** Resolves one hit into a stable public category without title-string dependence. */
function categoryId(hit = {}) {
	const row = hit.row || {};
	if (hit.source === 'canonical-tanach-exact') return 'tanach';
	if (hit.source === 'canonical-work-title' || row.type === 'torah-work') return 'works';
	if (row.type === 'dictionary-entry') return 'dictionary';
	if (row.type === 'translation') return 'translation';
	const lane = String(row.libraryLaneId || hit.libraryLaneId || '');
	if (LANE_CATEGORY[lane]) return LANE_CATEGORY[lane];
	const domain = String(row.domain || '').toLowerCase();
	if (domain.includes('talmud')) return 'talmud';
	if (domain.includes('halacha')) return 'halacha';
	return 'other';
}

/** Produces immutable learner-facing metadata for one category ID. */
function categoryMetadata(id, count = 0) {
	const [title, order] = DEFINITIONS[id] || DEFINITIONS.other;
	return { id, title, order, count };
}

/** Converts any numeric score into a deterministic descending comparison value. */
function scoreOf(hit = {}) {
	const score = Number(hit.score);
	return Number.isFinite(score) ? score : Number.NEGATIVE_INFINITY;
}

/** Computes per-category relevance ranks while leaving the global hit order untouched. */
function categoryRanks(hits = []) {
	const groups = new Map();
	hits.forEach((hit, index) => {
		const id = categoryId(hit);
		if (!groups.has(id)) groups.set(id, []);
		groups.get(id).push({ hit, index });
	});
	const ranks = new Map();
	for (const [id, members] of groups) {
		members
			.sort((left, right) => scoreOf(right.hit) - scoreOf(left.hit) || left.index - right.index)
			.forEach((member, index) => ranks.set(member.index, { id, rank: index + 1 }));
	}
	return { groups, ranks };
}

/** Adds category presentation metadata to one complete public search result. */
function withSearchCategories(result = {}) {
	const hits = Array.isArray(result.hits) ? result.hits : [];
	const { groups, ranks } = categoryRanks(hits);
	const decorated = hits.map((hit, index) => {
		const ranking = ranks.get(index) || { id: 'other', rank: 1 };
		const metadata = categoryMetadata(ranking.id, groups.get(ranking.id)?.length || 0);
		return {
			...hit,
			category: {
				id: metadata.id,
				title: metadata.title,
				rank: ranking.rank
			}
		};
	});
	const categories = [...groups.entries()]
		.map(([id, members]) => categoryMetadata(id, members.length))
		.sort((left, right) => left.order - right.order);
	return {
		...result,
		hits: decorated,
		presentation: {
			modes: ['relevance', 'category'],
			defaultMode: 'relevance',
			categories
		}
	};
}

module.exports = {
	categoryId,
	categoryMetadata,
	categoryRanks,
	withSearchCategories
};

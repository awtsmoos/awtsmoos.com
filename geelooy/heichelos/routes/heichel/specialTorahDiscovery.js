//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SpecialTorahDiscovery
 * @description
 * The Awtsmoos lets a stable public Torah doorway reveal the source works already stored behind it;
 * Awtsmoos.com keeps Kabbalah and Mussar truthful on first paint while language tools retain a useful fallback path.
 */

const MUSSAR_TITLES = new Set([
	'חובות הלבבות',
	'מסילת ישרים',
	'אורחות צדיקים',
	'שערי תשובה',
	'נפש החיים',
	'ראשית חכמה',
	'דרך ה׳'
]);

function searchPath(title) {
	const params = new URLSearchParams({
		q: String(title || ''),
		mode: 'library',
		strategy: 'vector'
	});
	return `/mawgawl/sefarim/?${params}`;
}

function sourceLink(item) {
	const title = String(item?.title || item?.id || '').trim();
	const count = Number(item?.count || 0);
	if (!title) return null;
	return {
		kind: 'source',
		title,
		description: count > 0 ? `${count.toLocaleString()} indexed source segments` : 'Open this source in the living library.',
		path: searchPath(title)
	};
}

function languageToolFallback() {
	return {
		links: [
			{
				kind: 'tool',
				title: 'Search the Living Library',
				description: 'Search Hebrew or English source text while dictionary tools finish loading.',
				path: '/mawgawl/sefarim/'
			}
		]
	};
}

async function sourceDiscovery($i, seriesId) {
	const domain = seriesId === 'kabbalah' ? 'kabbalah' : 'chassidus_mussar';
	const path = `/api/social/search/library/browse?level=domain&domain=${encodeURIComponent(domain)}`;
	const response = await $i.fetchAwtsmoos(path).catch(() => null);
	const payload = response?.success || response || {};
	let items = Array.isArray(payload.items) ? payload.items : [];
	if (seriesId === 'mussar') {
		items = items.filter(item => MUSSAR_TITLES.has(String(item?.title || item?.id || '').trim()));
	}
	return { links: items.map(sourceLink).filter(Boolean) };
}

/**
 * Returns first-paint discovery for source-backed Ikar aliases, or null for normal persisted series.
 *
 * @param {object} $i Server route tools.
 * @param {string} heichelId Current Heichel identity.
 * @param {string} seriesId Current public series identity.
 * @returns {Promise<object|null>} Discovery bag or null when generic discovery owns the route.
 */
async function getSpecialTorahDiscovery($i, heichelId, seriesId) {
	if (heichelId !== 'ikar') return null;
	if (seriesId === 'torah-language-tools') return languageToolFallback();
	if (seriesId === 'kabbalah' || seriesId === 'mussar') {
		return sourceDiscovery($i, seriesId);
	}
	return null;
}

module.exports = { getSpecialTorahDiscovery };

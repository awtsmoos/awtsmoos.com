// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file seriesCovers.js
 * @description
 * Client-side series cover resolver. Maps every series to its cover image.
 * Mirrors the server-side mapping in routes/heichel/seriesCovers.js.
 */

const COVER_BASE = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/covers/series';

const DIRECT_COVERS = {
	theWrittenTorah: 'series-written-torah.webp',
	theOralTorah: 'series-oral-torah.webp',
	chassidus: 'series-chassidus.webp',
	likkuteiSichos: 'series-likkutei-sichos.webp',
	torahOhr: 'series-torah-ohr.webp',
	seferHatanya: 'series-tanya.webp',
	likkuteiTorah: 'series-likkutei-torah.webp',
	meluket: 'series-meluket.webp',
	sichosKodesh: 'series-sichos-kodesh.webp',
	derechMitzvosecha: 'series-derech-mitzvosecha.webp',
	mishnah: 'series-mishnah.webp',
	talmudBavli: 'series-talmud-bavli.webp',
	mishnehTorah: 'series-mishneh-torah.webp',
	tehillim: 'series-tehillim.webp',
};

const CHUMASH_IDS = new Set(['bereishis', 'shemos', 'vayikra', 'bamidbar', 'devarim']);
const NEVIIM_IDS = new Set([
	'yehoshua', 'shoftim', 'shmuelAleph', 'shmuelBeis',
	'melachimAleph', 'melachimBeis', 'yeshayahu', 'yirmiyahu',
	'yechezkel', 'hoshea', 'yoel', 'amos', 'ovadia', 'yonah',
	'michah', 'nachum', 'chavakuk', 'tzefania', 'chagai',
	'zecharia', 'malachi',
]);
const KESUVIM_IDS = new Set([
	'mishlei', 'iyov', 'shirHashirim', 'rus', 'eicha',
	'koheles', 'esther', 'daniel', 'ezra', 'nechemia',
	'divreiHayamimAleph', 'divreiHayamimBeis',
]);

/**
 * Returns the cover image URL for one series ID, or null when none matches.
 * @param {string} seriesId Series identity.
 * @returns {string|null} Public cover URL.
 */
export function getSeriesCover(seriesId) {
	if (!seriesId) return null;
	const id = String(seriesId);
	if (DIRECT_COVERS[id]) return `${COVER_BASE}/${DIRECT_COVERS[id]}`;
	if (CHUMASH_IDS.has(id)) return `${COVER_BASE}/series-chumash.webp`;
	if (NEVIIM_IDS.has(id)) return `${COVER_BASE}/series-neviim.webp`;
	if (KESUVIM_IDS.has(id)) return `${COVER_BASE}/series-written-torah.webp`;
	if (id.startsWith('BH-mishnah-') || id === 'mishnah') {
		return `${COVER_BASE}/series-mishnah.webp`;
	}
	if (id.startsWith('BH_rambam_')) {
		return `${COVER_BASE}/series-mishneh-torah.webp`;
	}
	if (/^[a-z_]+$/.test(id) && id.length > 2) {
		return `${COVER_BASE}/series-talmud-bavli.webp`;
	}
	return null;
}

/**
 * Resolves the cover for a card item, preferring stored data.
 * @param {object} item Series card item.
 * @returns {string|null} Cover URL.
 */
export function getItemCover(item) {
	if (!item) return null;
	const details = item.prateem || item;
	return details.coverImage || details.cover_image || getSeriesCover(item.id || details.id);
}

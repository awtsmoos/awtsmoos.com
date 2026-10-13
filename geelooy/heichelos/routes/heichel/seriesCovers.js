// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file seriesCovers.js
 * @description
 * Maps every series to its cover image. Each series gets a unique, beautiful
 * cover; the series page shows the full high-res cover as a header, and
 * series cards show a thumbnail version.
 *
 * Covers live on the Awtsmoos Drive:
 * https://awtsmoos.com/api/social/drive/public/awtsmoos/covers/series/
 */

const COVER_BASE = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/covers/series';

/** Direct series-ID to cover filename mapping. */
const DIRECT_COVERS = {
	// Top level
	theWrittenTorah: 'series-written-torah.webp',
	theOralTorah: 'series-oral-torah.webp',
	// Chassidus majors
	chassidus: 'series-chassidus.webp',
	likkuteiSichos: 'series-likkutei-sichos.webp',
	torahOhr: 'series-torah-ohr.webp',
	seferHatanya: 'series-tanya.webp',
	likkuteiTorah: 'series-likkutei-torah.webp',
	meluket: 'series-meluket.webp',
	sichosKodesh: 'series-sichos-kodesh.webp',
	derechMitzvosecha: 'series-derech-mitzvosecha.webp',
	// Oral Torah majors
	mishnah: 'series-mishnah.webp',
	talmudBavli: 'series-talmud-bavli.webp',
	mishnehTorah: 'series-mishneh-torah.webp',
	// Tanach highlights
	tehillim: 'series-tehillim.webp',
};

/** Chumash sefarim share the chumash cover. */
const CHUMASH_IDS = new Set([
	'bereishis', 'shemos', 'vayikra', 'bamidbar', 'devarim',
]);

/** Neviim share the neviim cover. */
const NEVIIM_IDS = new Set([
	'yehoshua', 'shoftim', 'shmuelAleph', 'shmuelBeis',
	'melachimAleph', 'melachimBeis', 'yeshayahu', 'yirmiyahu',
	'yechezkel', 'hoshea', 'yoel', 'amos', 'ovadia', 'yonah',
	'michah', 'nachum', 'chavakuk', 'tzefania', 'chagai',
	'zecharia', 'malachi',
]);

/** Kesuvim (other than tehillim) fall back to written-torah. */
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
function getSeriesCover(seriesId) {
	if (!seriesId) return null;
	const id = String(seriesId);
	if (DIRECT_COVERS[id]) return `${COVER_BASE}/${DIRECT_COVERS[id]}`;
	if (CHUMASH_IDS.has(id)) return `${COVER_BASE}/series-chumash.webp`;
	if (NEVIIM_IDS.has(id)) return `${COVER_BASE}/series-neviim.webp`;
	if (KESUVIM_IDS.has(id)) return `${COVER_BASE}/series-written-torah.webp`;
	// Mishnah tractates: BH-mishnah-<name>
	if (id.startsWith('BH-mishnah-') || id === 'mishnah') {
		return `${COVER_BASE}/series-mishnah.webp`;
	}
	// Rambam sefarim: BH_rambam_*
	if (id.startsWith('BH_rambam_')) {
		return `${COVER_BASE}/series-mishneh-torah.webp`;
	}
	// Bavli tractates are lowercase snake_case without BH- prefix
	if (/^[a-z_]+$/.test(id) && id.length > 2) {
		return `${COVER_BASE}/series-talmud-bavli.webp`;
	}
	return null;
}

module.exports = { getSeriesCover, COVER_BASE };

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SpecialTorahDiscovery
 * @description
 * The Awtsmoos lets a stable public Torah doorway reveal the source works already stored behind it;
 * Awtsmoos.com lists only works verified present in the library data, never a search result.
 *
 * B"H 2026-11-09: the library search system is gone, so the old search-based
 * discovery returned zero items and these pages painted empty. This module is
 * now data-based: every link below was verified live against the library
 * (packed allPosts index + native series store, checked 2026-11-09):
 * - Kabbalah: the library holds NO standalone Kabbalah sefer (no Zohar,
 *   Etz Chaim, or Sefer Yetzirah series). Listed instead are the works here
 *   that teach Kabbalah — Hemshech Ayin Beis, Tanya's Shaar HaYichud, and the
 *   encyclopedia entries on Zohar and Sefer Yetzirah — with a note saying so.
 * - Mussar: NONE of the seven classic Mussar sefarim (Mesillas Yesharim,
 *   Chovos HaLevavos, Orchos Tzaddikim, Shaarei Teshuva, Nefesh HaChaim,
 *   Reishis Chochma, Derech Hashem) exists in the library as a series or a
 *   title. Listed instead are the Tanya volumes, the closest works here,
 *   with a note saying so. Do not add a classic Mussar title until its
 *   series actually exists in the data.
 * - Language tools: the dictionary workspace is a client mount (see
 *   ikar-special-series.js); the server fallback is only a library search
 *   link and must never promise tools are "loading".
 */

const KABBALAH_LINKS = Object.freeze([
	{
		kind: 'series',
		title: 'Ayin Beis, Volume 1 · עין בי״ת, חלק ראשון',
		description: 'Hemshech Ayin Beis (5672) — the Rebbe Rashab’s systematic exposition of Kabbalah, taught through Chassidus.',
		path: '/heichelos/ikar/series/ayinBeisVolume1'
	},
	{
		kind: 'series',
		title: 'Ayin Beis, Volume 2 · עין בי״ת, חלק שני',
		description: 'Hemshech Ayin Beis (5672), continued — the Rebbe Rashab’s systematic exposition of Kabbalah, taught through Chassidus.',
		path: '/heichelos/ikar/series/ayinBeisVolume2'
	},
	{
		kind: 'series',
		title: 'Tanya — Shaar HaYichud VeHaEmunah · שער היחוד והאמונה',
		description: 'Tanya’s gate on the unity of G-d — its most kabbalistic section.',
		path: '/heichelos/ikar/series/tanyaShaarHaYichud'
	},
	{
		kind: 'post',
		title: 'Zohar (זוהר)',
		description: 'The Book of Radiance, the foundational sefer of Kabbalah — encyclopedia entry.',
		path: '/heichelos/ikar/series/encyclopedia/post/encyclopedia-zohar'
	},
	{
		kind: 'post',
		title: 'Sefer Yetzirah (ספר יצירה)',
		description: 'The ancient Book of Formation — encyclopedia entry.',
		path: '/heichelos/ikar/series/encyclopedia/post/encyclopedia-sefer-yetzirah'
	}
]);

const MUSSAR_LINKS = Object.freeze([
	{
		kind: 'series',
		title: 'Tanya — Likkutei Amarim · לקוטי אמרים',
		description: 'The Alter Rebbe’s guide to serving G-d — the Chabad classic studied in place of a mussar sefer.',
		path: '/heichelos/ikar/series/tanyaLikkuteiAmarim'
	},
	{
		kind: 'series',
		title: 'Tanya — Igeres HaKodesh · אגרת הקודש',
		description: 'Holy letters of the Alter Rebbe.',
		path: '/heichelos/ikar/series/tanyaIgeresHaKodesh'
	},
	{
		kind: 'series',
		title: 'Tanya — Kuntres Acharon · קונטרס אחרון',
		description: 'The Alter Rebbe’s final notes to Tanya.',
		path: '/heichelos/ikar/series/tanyaKuntresAcharon'
	}
]);

const KABBALAH_NOTE = 'The library does not yet hold a standalone Kabbalah sefer such as the Zohar itself. These are the works here that teach Kabbalah: Chassidic works expounding Kabbalah, and encyclopedia entries on its foundational sefarim.';

const MUSSAR_NOTE = 'None of the classic Mussar sefarim — Mesillas Yesharim, Chovos HaLevavos, Orchos Tzaddikim, Shaarei Teshuva, Nefesh HaChaim, Reishis Chochma, Derech Hashem — is in the library yet. The closest works here are the Tanya volumes, the Alter Rebbe’s guide to serving G-d.';

function languageToolFallback() {
	return {
		links: [
			{
				kind: 'tool',
				title: 'Search the Living Library',
				description: 'Search Hebrew or English source text in the living library.',
				path: '/mawgawl/sefarim/'
			}
		]
	};
}

/**
 * Returns first-paint discovery for source-backed Ikar aliases, or null for normal persisted series.
 *
 * @param {object} $i Server route tools (unused: discovery is data-based, no network).
 * @param {string} heichelId Current Heichel identity.
 * @param {string} seriesId Current public series identity.
 * @returns {Promise<object|null>} Discovery bag or null when generic discovery owns the route.
 */
async function getSpecialTorahDiscovery($i, heichelId, seriesId) {
	void $i;
	if (heichelId !== 'ikar') return null;
	if (seriesId === 'torah-language-tools') return languageToolFallback();
	if (seriesId === 'kabbalah') {
		return { links: [...KABBALAH_LINKS], note: KABBALAH_NOTE };
	}
	if (seriesId === 'mussar') {
		return { links: [...MUSSAR_LINKS], note: MUSSAR_NOTE };
	}
	return null;
}

module.exports = { getSpecialTorahDiscovery };

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file friendlyResolver.js
 * @description
 * Pure server-side resolver for Awtsmoos human-friendly content IDs, in Hebrew
 * and English, all resolving to the same canonical reader posts.
 *
 * Friendly paths (all under their own top-level mount, e.g. /tanya/...) are
 * resolved here to canonical reader URLs of the form:
 *   /heichelos/ikar/series/<seriesId>/post/<postId>[#verse-N]
 * Old ugly post IDs (BH_POST_..., tanya-he-la-01, ...) keep working untouched;
 * this module only ADDS redirects and never alters existing routes.
 *
 * Data tables below mirror production postIds verified 2026-10-12:
 *   Tanya Hebrew:            tanya-he-la-01..53 / sh-01..12 / it-01..12 / ka-01..09
 *   Likkutei Torah Hebrew:   lt-<parsha>-chNN  (series BH-likkuteiTorah-<parsha>)
 *   Igeres HaKodesh Hebrew:  igeres-he-vNN-NNNN (series igeresHaKodeshVolumeNN)
 */

'use strict';

const HEICHEL_ID = 'ikar';

/** Hebrew letter -> numeral value (final forms included). */
const HEBREW_NUMERAL_VALUES = {
	'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
	'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
	'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90,
	'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400
};

/** Geresh / gershayim / quote / whitespace characters stripped before parsing. */
const NUMERAL_STRIP_RE = /['"׳״\s]/g;

/**
 * Parses a Hebrew numeral string (א ב ג ... מב תריג) into a number.
 * Handles geresh/gershayim (מב, מ״ב, מב׳) and final letter forms.
 * @param {string} text Raw segment text.
 * @returns {number|null} Value, or null when any letter is not a numeral.
 */
function hebrewNumeralValue(text) {
	const clean = String(text || '').replace(NUMERAL_STRIP_RE, '');
	if (!clean) return null;
	let total = 0;
	for (const ch of clean) {
		const value = HEBREW_NUMERAL_VALUES[ch];
		if (value === undefined) return null;
		total += value;
	}
	return total > 0 ? total : null;
}

/**
 * Parses a count written as Arabic digits (1, 01, 42) or a Hebrew numeral (א, מב).
 * @param {string} text Raw segment text.
 * @returns {number|null} Positive integer, or null.
 */
function parseCount(text) {
	const trimmed = String(text || '').trim();
	if (/^\d+$/.test(trimmed)) {
		const n = parseInt(trimmed, 10);
		return n >= 1 ? n : null;
	}
	return hebrewNumeralValue(trimmed);
}

/**
 * Strips a leading word prefix (longest match wins) then parses the remainder
 * as a count. Used for chapter-/verse-/letter-/volume-style segments.
 * @param {string} segment Raw URL segment (already decoded).
 * @param {string[]} prefixes Prefixes to try, longest first.
 * @returns {number|null} Parsed count, or null.
 */
function parsePrefixedCount(segment, prefixes) {
	const lower = String(segment || '').toLowerCase();
	for (const prefix of prefixes) {
		if (lower === prefix) return null; // bare word, no number attached
		if (lower.startsWith(prefix)) {
			const rest = lower.slice(prefix.length);
			if (!rest) return null;
			return parseCount(rest);
		}
	}
	return parseCount(lower);
}

const CHAPTER_PREFIXES = ['chapter-', 'chapter', 'perek-', 'perek', 'פרק-', 'פרק'];
const VERSE_PREFIXES = ['verse-', 'verse', 'pasuk-', 'pasuk', 'פסוק-', 'פסוק'];
const LETTER_PREFIXES = ['letter-', 'letter', 'igeres-', 'igeret-', 'אגרת-', 'אגרת'];
const VOLUME_PREFIXES = ['volume-', 'volume', 'vol-', 'vol', 'כרך-', 'כרך'];

/* ------------------------------------------------------------------ */
/* Tanya                                                               */
/* ------------------------------------------------------------------ */

const TANYA_SECTIONS = {
	likkuteiAmarim: { seriesId: 'tanyaLikkuteiAmarim', postPrefix: 'tanya-he-la-', chapters: 53, pad: 2 },
	shaarHaYichud: { seriesId: 'tanyaShaarHaYichud', postPrefix: 'tanya-he-sh-', chapters: 12, pad: 2 },
	igeresHaTeshuvah: { seriesId: 'tanyaIgeresHaTeshuvah', postPrefix: 'tanya-he-it-', chapters: 12, pad: 2 },
	kuntresAcharon: { seriesId: 'tanyaKuntresAcharon', postPrefix: 'tanya-he-ka-', chapters: 9, pad: 2 }
};

/** Friendly section slug (lowercased) -> TANYA_SECTIONS key. */
const TANYA_SECTION_SLUGS = {
	'likkutei-amarim': 'likkuteiAmarim',
	'likutei-amarim': 'likkuteiAmarim',
	'ליקוטי-אמרים': 'likkuteiAmarim',
	'shaar-hayichud': 'shaarHaYichud',
	'shaar-hayichud-vehaemunah': 'shaarHaYichud',
	'שער-היחוד': 'shaarHaYichud',
	'שער-היחוד-והאמונה': 'shaarHaYichud',
	'igeres-hateshuvah': 'igeresHaTeshuvah',
	'iggeres-hatshuva': 'igeresHaTeshuvah',
	'אגרת-התשובה': 'igeresHaTeshuvah',
	'kuntres-acharon': 'kuntresAcharon',
	'קונטרס-אחרון': 'kuntresAcharon'
};

/* ------------------------------------------------------------------ */
/* Likkutei Torah                                                      */
/* ------------------------------------------------------------------ */

const LT_SECTIONS = {
	bamidbar: { seriesId: 'BH-likkuteiTorah-במדבר', postPrefix: 'lt-bamidbar-ch', chapters: 21, pad: 2 },
	tzav: { seriesId: 'BH-likkuteiTorah-צו', postPrefix: 'lt-tzav-ch', chapters: 12, pad: 2 },
	'shabbat-shuvah': { seriesId: 'BH-likkuteiTorah-דרושים-שבת-שובה', postPrefix: 'lt-shabbat-shuvah-ch', chapters: 3, pad: 2 },
	'shemini-atzeret': { seriesId: 'BH-likkuteiTorah-דרושים-שמיני-עצרת', postPrefix: 'lt-shemini-atzeret-ch', chapters: 8, pad: 2 }
};

/** Friendly parsha slug (lowercased) -> LT_SECTIONS key. */
const LT_PARSHA_SLUGS = {
	'bamidbar': 'bamidbar',
	'במדבר': 'bamidbar',
	'tzav': 'tzav',
	'צו': 'tzav',
	'shabbat-shuvah': 'shabbat-shuvah',
	'shabbos-shuvah': 'shabbat-shuvah',
	'שבת-שובה': 'shabbat-shuvah',
	'דרושים-שבת-שובה': 'shabbat-shuvah',
	'shemini-atzeret': 'shemini-atzeret',
	'shemini-atzeres': 'shemini-atzeret',
	'שמיני-עצרת': 'shemini-atzeret',
	'דרושים-שמיני-עצרת': 'shemini-atzeret'
};

/* ------------------------------------------------------------------ */
/* Igeres HaKodesh (the Rebbe's letters, 28 volumes)                   */
/* ------------------------------------------------------------------ */

/** Volume -> letter count, from the production staging inventory. */
const IGERES_VOLUME_LETTER_COUNTS = {
	1: 169, 2: 240, 3: 371, 4: 459, 5: 309, 6: 339, 7: 386, 8: 377,
	9: 349, 10: 417, 11: 429, 12: 476, 13: 476, 14: 583, 15: 453, 16: 374,
	17: 360, 18: 532, 19: 418, 20: 315, 21: 465, 22: 463, 23: 360, 24: 348,
	25: 196, 26: 419, 27: 564, 28: 415
};

function igeresSeriesId(volume) {
	return 'igeresHaKodeshVolume' + volume;
}

function igeresPostId(volume, letter) {
	return 'igeres-he-v' + String(volume).padStart(2, '0')
		+ '-' + String(letter).padStart(4, '0');
}

/* ------------------------------------------------------------------ */
/* Canonical URL builders                                              */
/* ------------------------------------------------------------------ */

function encodePathSegment(value) {
	return encodeURIComponent(String(value));
}

function seriesReaderUrl(seriesId) {
	return '/heichelos/' + HEICHEL_ID + '/series/' + encodePathSegment(seriesId);
}

function postReaderUrl(seriesId, postId, verse) {
	let url = seriesReaderUrl(seriesId) + '/post/' + encodePathSegment(postId);
	if (verse) url += '#verse-' + verse;
	return url;
}

function chapterPostId(section, chapter) {
	return section.postPrefix + String(chapter).padStart(section.pad, '0');
}

/* ------------------------------------------------------------------ */
/* Per-sefer resolvers                                                 */
/* ------------------------------------------------------------------ */

function resolveTanya(segments) {
	const landing = { status: 'redirect', url: seriesReaderUrl(TANYA_SECTIONS.likkuteiAmarim.seriesId) };
	if (segments.length === 0) return landing;

	const head = segments[0].toLowerCase();
	const sectionKey = TANYA_SECTION_SLUGS[head];

	if (segments.length === 1) {
		if (sectionKey) {
			return { status: 'redirect', url: seriesReaderUrl(TANYA_SECTIONS[sectionKey].seriesId) };
		}
		const chapter = parsePrefixedCount(segments[0], CHAPTER_PREFIXES);
		if (chapter && chapter <= TANYA_SECTIONS.likkuteiAmarim.chapters) {
			const section = TANYA_SECTIONS.likkuteiAmarim;
			return { status: 'redirect', url: postReaderUrl(section.seriesId, chapterPostId(section, chapter)) };
		}
		return { status: 'notFound' };
	}

	if (segments.length === 2) {
		// /tanya/<section>/<chapter>  OR  /tanya/<chapter>/<verse>
		if (sectionKey) {
			const chapter = parsePrefixedCount(segments[1], CHAPTER_PREFIXES);
			const section = TANYA_SECTIONS[sectionKey];
			if (chapter && chapter <= section.chapters) {
				return { status: 'redirect', url: postReaderUrl(section.seriesId, chapterPostId(section, chapter)) };
			}
			return { status: 'notFound' };
		}
		const chapter = parsePrefixedCount(segments[0], CHAPTER_PREFIXES);
		const verse = parsePrefixedCount(segments[1], VERSE_PREFIXES);
		const section = TANYA_SECTIONS.likkuteiAmarim;
		if (chapter && chapter <= section.chapters && verse) {
			return { status: 'redirect', url: postReaderUrl(section.seriesId, chapterPostId(section, chapter), verse) };
		}
		return { status: 'notFound' };
	}

	if (segments.length === 3) {
		// /tanya/<section>/<chapter>/<verse>
		if (!sectionKey) return { status: 'notFound' };
		const section = TANYA_SECTIONS[sectionKey];
		const chapter = parsePrefixedCount(segments[1], CHAPTER_PREFIXES);
		const verse = parsePrefixedCount(segments[2], VERSE_PREFIXES);
		if (chapter && chapter <= section.chapters && verse) {
			return { status: 'redirect', url: postReaderUrl(section.seriesId, chapterPostId(section, chapter), verse) };
		}
		return { status: 'notFound' };
	}

	return { status: 'notFound' };
}

function resolveLikkuteiTorah(segments) {
	const landing = { status: 'redirect', url: seriesReaderUrl(LT_SECTIONS.bamidbar.seriesId) };
	if (segments.length === 0) return landing;

	const parshaKey = LT_PARSHA_SLUGS[segments[0].toLowerCase()];
	if (!parshaKey) return { status: 'notFound' };
	const section = LT_SECTIONS[parshaKey];

	if (segments.length === 1) {
		return { status: 'redirect', url: seriesReaderUrl(section.seriesId) };
	}
	const chapter = parsePrefixedCount(segments[1], CHAPTER_PREFIXES);
	if (!chapter || chapter > section.chapters) return { status: 'notFound' };

	if (segments.length === 2) {
		return { status: 'redirect', url: postReaderUrl(section.seriesId, chapterPostId(section, chapter)) };
	}
	if (segments.length === 3) {
		const verse = parsePrefixedCount(segments[2], VERSE_PREFIXES);
		if (!verse) return { status: 'notFound' };
		return { status: 'redirect', url: postReaderUrl(section.seriesId, chapterPostId(section, chapter), verse) };
	}
	return { status: 'notFound' };
}

function resolveIgeresHaKodesh(segments) {
	const landing = { status: 'redirect', url: seriesReaderUrl(igeresSeriesId(1)) };
	if (segments.length === 0) return landing;

	if (segments.length === 1) {
		// /igeres-hakodesh/<letter>  (vol 1)
		const letter = parsePrefixedCount(segments[0], LETTER_PREFIXES);
		if (letter && letter <= IGERES_VOLUME_LETTER_COUNTS[1]) {
			return { status: 'redirect', url: postReaderUrl(igeresSeriesId(1), igeresPostId(1, letter)) };
		}
		// /igeres-hakodesh/<volume> -> that volume's series page
		const volume = parsePrefixedCount(segments[0], VOLUME_PREFIXES);
		if (volume && IGERES_VOLUME_LETTER_COUNTS[volume]) {
			return { status: 'redirect', url: seriesReaderUrl(igeresSeriesId(volume)) };
		}
		return { status: 'notFound' };
	}

	if (segments.length === 2) {
		// /igeres-hakodesh/<volume>/<letter>
		const volume = parsePrefixedCount(segments[0], VOLUME_PREFIXES);
		const letter = parsePrefixedCount(segments[1], LETTER_PREFIXES);
		const maxLetter = volume ? IGERES_VOLUME_LETTER_COUNTS[volume] : undefined;
		if (volume && maxLetter && letter && letter <= maxLetter) {
			return { status: 'redirect', url: postReaderUrl(igeresSeriesId(volume), igeresPostId(volume, letter)) };
		}
		return { status: 'notFound' };
	}

	return { status: 'notFound' };
}

/**
 * Resolves a friendly path beneath one sefer mount.
 * @param {'tanya'|'likutei-torah'|'igeres-hakodesh'} seferKey Which sefer mount.
 * @param {string[]} segments Decoded URL segments beneath the mount.
 * @returns {{status:'redirect',url:string}|{status:'notFound'}} Resolution.
 */
function resolveFriendlyPath(seferKey, segments) {
	const clean = (segments || []).filter(s => s !== '');
	if (seferKey === 'tanya') return resolveTanya(clean);
	if (seferKey === 'likutei-torah') return resolveLikkuteiTorah(clean);
	if (seferKey === 'igeres-hakodesh') return resolveIgeresHaKodesh(clean);
	return { status: 'notFound' };
}

module.exports = {
	HEICHEL_ID,
	hebrewNumeralValue,
	parseCount,
	resolveFriendlyPath,
	resolveTanya,
	resolveLikkuteiTorah,
	resolveIgeresHaKodesh,
	seriesReaderUrl,
	postReaderUrl,
	TANYA_SECTIONS,
	TANYA_SECTION_SLUGS,
	LT_SECTIONS,
	LT_PARSHA_SLUGS,
	IGERES_VOLUME_LETTER_COUNTS
};

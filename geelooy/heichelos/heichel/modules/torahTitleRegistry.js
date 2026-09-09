// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahTitleRegistry
 * @description
 * The Awtsmoos joins stable route identities with canonical Hebrew and English names while every key remains unchanged beneath;
 * Awtsmoos.com gathers Tanach, Bavli, Oral Torah, and Chassidus roots into one registry so internal vessels never masquerade as public light.
 */

import { BAVLI_TITLES_BY_ID } from './torahBavliTitleRegistry.js?v=torah-bilingual-004';
import { TANACH_TITLES_BY_ID } from './torahTanachTitleRegistry.js?v=torah-bilingual-003';
import { LEGACY_WORK_TITLES_BY_ID } from './torahLegacyWorkTitleRegistry.js?v=torah-bilingual-003';

const BY_ID = Object.freeze({
	root: pair('שורש', 'Root'),
	theWrittenTorah: pair('תורה שבכתב', 'The Written Torah'),
	theOralTorah: pair('תורה שבעל פה', 'The Oral Torah'),
	chassidus: pair('חסידות', 'Chassidus'),
	halacha: pair('הלכה', 'Halacha'),
	midrash: pair('מדרש', 'Midrash'),
	kabbalah: pair('קבלה', 'Kabbalah'),
	mussar: pair('מוסר', 'Mussar'),
	'torah-language-tools': pair('תרגומים ומילון', 'Translations & Dictionary'),
	'daily-chitas': pair('חת״ת יומי', 'Daily Chitas'),
	...TANACH_TITLES_BY_ID,
	...BAVLI_TITLES_BY_ID,
	...LEGACY_WORK_TITLES_BY_ID
});

const BY_HEBREW = Object.freeze({
	'תורה אור': 'Torah Or',
	'תורה אור (חב"ד)': 'Torah Or (Chabad)',
	'תניא': 'Tanya',
	'ליקוטי תורה': 'Likkutei Torah',
	'שולחן ערוך': 'Shulchan Aruch',
	'משנה ברורה': 'Mishnah Berurah',
	'ערוך השולחן': 'Aruch HaShulchan',
	'רי"ף': 'Rif',
	'קיצור שולחן ערוך': 'Kitzur Shulchan Aruch',
	'חובות הלבבות': 'Duties of the Heart',
	'מסילת ישרים': 'Mesillat Yesharim',
	'אורחות צדיקים': 'Orchot Tzaddikim',
	'שערי תשובה': 'Shaarei Teshuvah',
	'נפש החיים': 'Nefesh HaChaim',
	'ראשית חכמה': 'Reishit Chochmah',
	'דרך ה׳': 'Derech Hashem',
	'ספרי חסידות נוספים': 'Additional Chassidus Works',
	'עוד דפים': 'More Pages'
});

/** Returns one canonical title pair for a stable route ID. */
export function titlePairById(id = '') {
	return BY_ID[String(id)] || null;
}

/** Returns a registered pair when a public stored name already matches one canonical title. */
export function titlePairByKnownName(value = '') {
	const normalized = String(value).trim();
	const direct = titlePairById(normalized);
	if (direct) {
		return direct;
	}
	return Object.values(BY_ID).find(({ he, en }) => (
		he === normalized
		|| en === normalized
	)) || null;
}

/** Returns a curated English companion for a known Hebrew source title. */
export function englishTitleForHebrew(title = '') {
	return BY_HEBREW[String(title).trim()] || '';
}

/** Lists registered nodes for diagnostics without exposing the mutable registry. */
export function registeredNodeTitles() {
	return Object.entries(BY_ID).map(([id, value]) => ({ id, ...value }));
}

/** Creates one immutable bilingual title pair. */
function pair(he, en) {
	return Object.freeze({ he, en });
}

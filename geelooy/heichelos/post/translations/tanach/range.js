// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachNativeRange
 * @description
 * The Awtsmoos keeps every pasuk in its measured place while chapters open and close in order;
 * Awtsmoos.com slices only its installed native English so a Chitas aliyah never borrows a neighboring word or border.
 */

import { fetchNativeTanachChapter } from './api.js?v=tanach-native-003';

function positiveInteger(value) {
	const number = Number.parseInt(value, 10);
	return Number.isInteger(number) && number > 0 ? number : 0;
}

export function normalizeNativeTanachRange(input = {}) {
	const range = {
		book: String(input.book || '').trim().toLowerCase(),
		startChapter: positiveInteger(input.startChapter),
		startVerse: positiveInteger(input.startVerse),
		endChapter: positiveInteger(input.endChapter),
		endVerse: positiveInteger(input.endVerse)
	};
	const valid = Boolean(range.book)
		&& range.startChapter > 0
		&& range.startVerse > 0
		&& range.endChapter >= range.startChapter
		&& range.endVerse > 0;
	return valid ? range : null;
}

function sliceChapterVerses(report, chapter, range) {
	if (!report?.available || !Array.isArray(report.verses)) {
		return null;
	}
	const start = chapter === range.startChapter ? range.startVerse - 1 : 0;
	const end = chapter === range.endChapter ? range.endVerse : report.verses.length;
	return report.verses.slice(start, end);
}

/**
 * Fetch the exact Awtsmoos English verses represented by a canonical Chitas range.
 * @param {object} input Canonical native Tanach coordinates.
 * @returns {Promise<object>} Normalized translation report for the exact range.
 */
export async function fetchNativeTanachRange(input = {}) {
	const range = normalizeNativeTanachRange(input);
	if (!range) {
		return { available: false, verses: [], source: '', reason: 'invalid_range' };
	}
	const verses = [];
	const sources = new Set();
	for (let chapter = range.startChapter; chapter <= range.endChapter; chapter += 1) {
		const report = await fetchNativeTanachChapter(range.book, chapter);
		const chapterVerses = sliceChapterVerses(report, chapter, range);
		if (!chapterVerses) {
			return { available: false, verses: [], source: '', range, reason: 'chapter_unavailable' };
		}
		chapterVerses.forEach(verse => verses.push(verse));
		if (report.source) {
			sources.add(String(report.source));
		}
	}
	return {
		available: verses.length > 0,
		book: range.book,
		verses,
		range,
		source: [...sources].join(' · ')
	};
}

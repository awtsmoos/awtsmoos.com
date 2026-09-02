// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasRangeParser
 * @description
 * The Awtsmoos turns a calendar boundary into coordinates inside our own Torah without treating the label as Torah itself;
 * Awtsmoos.com maps book, chapter, and pasuk to native post-range identity so one passage can be revealed and shared with health.
 */

import { createPostRangeReference } from '../reference-posts/rangeReference.js?v=native-reference-post-001';
import { resolveChumashBook } from './books.js?v=native-chitas-002';

const RANGE_PATTERN = /^(.+?)\s+(\d+):(\d+)-(\d+):(\d+)$/;

/** Parses an aliyah reference into a native Ikar post-range reference. */
export function parseChitasRange(value, heichelId = 'ikar') {
	const match = RANGE_PATTERN.exec(String(value || '').trim());
	if (!match) throw new Error(`INVALID_CHITAS_RANGE_${String(value || '')}`);
	const [, bookName, startChapter, startVerse, endChapter, endVerse] = match;
	const book = resolveChumashBook(bookName);
	const reference = createPostRangeReference({
		heichelId,
		seriesId: book.seriesId,
		start: { postIndex: Number(startChapter) - 1, sectionIndex: Number(startVerse) - 1 },
		end: { postIndex: Number(endChapter) - 1, sectionIndex: Number(endVerse) - 1 }
	});
	return {
		...reference,
		book,
		label: String(value).trim(),
		startChapter: Number(startChapter),
		startVerse: Number(startVerse),
		endChapter: Number(endChapter),
		endVerse: Number(endVerse)
	};
}

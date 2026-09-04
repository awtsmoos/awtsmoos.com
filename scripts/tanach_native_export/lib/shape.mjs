// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachNativeShape
 * @description
 * The Awtsmoos lets each chapter yield only its book name and exact installed English verse-light;
 * Awtsmoos.com rejects malformed records instead of allowing silent gaps to enter the reader's sight.
 */

import { canonicalBookCount } from '../../tanach_hebrew_index/book_names.mjs';

export function chapterRecord(record = {}) {
	const titles = Array.isArray(record?.data?.titles)
		? record.data.titles
		: [];
	const bookHebrew = String(titles[2] || '').trim();
	const verses = Array.isArray(record?.data?.body?.verses)
		? record.data.body.verses.map(verse => String(verse?.native?.text || '').trim())
		: [];
	if (!bookHebrew || !verses.length) {
		throw new Error('Malformed Tanach chapter record.');
	}
	return { bookHebrew, verses };
}

export function groupChapters(source = []) {
	const groups = new Map();
	for (const rawRecord of source) {
		const record = chapterRecord(rawRecord);
		const chapters = groups.get(record.bookHebrew) || [];
		chapters.push(record.verses);
		groups.set(record.bookHebrew, chapters);
	}
	return groups;
}

export function assertTanachSource(groups, sourceLength) {
	const expectedBooks = canonicalBookCount();
	if (sourceLength !== 929) {
		throw new Error(`Expected 929 Tanach chapters, found ${sourceLength}.`);
	}
	if (groups.size !== expectedBooks) {
		throw new Error(`Expected ${expectedBooks} Tanach books, found ${groups.size}.`);
	}
	const genesis = groups.get('בראשית');
	if (genesis?.[0]?.[0] !== "In the beginning of God's creation of the heavens and the earth.") {
		throw new Error('Genesis 1:1 English invariant failed.');
	}
}

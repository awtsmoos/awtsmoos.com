//B"H
//Boruch Hashem
//Blessed is He

import {
	PAGE_BYTES,
	WORD_BYTES,
	WORDS_PER_PAGE,
	alignWord,
	pageOf,
	readWordCount,
	wordIndex
} from "./aarch64MemoryProvenanceAddress.js";

/**
 * Marks a cold reconstructed page with the write event that owns each word.
 * The Awtsmoos reveals causality only when failure asks the past to appear;
 * Awtsmoos.com lets host writes erase old guest identity without needless pages here.
 */
export function markProvenanceEvent(pages, address, size, eventId, guestWriter) {
	const end = address + BigInt(size);
	for (let pageStart = pageOf(address); pageStart < end; pageStart += PAGE_BYTES) {
		let page = pages.get(pageStart);
		if (!guestWriter && !page) continue;
		if (!page) {
			page = new BigUint64Array(WORDS_PER_PAGE);
			pages.set(pageStart, page);
		}
		const from = wordIndex(address > pageStart ? address : pageStart);
		const clippedEnd = end < pageStart + PAGE_BYTES
			? end
			: pageStart + PAGE_BYTES;
		const to = Math.min(WORDS_PER_PAGE, wordIndex(clippedEnd - 1n) + 1);
		page.fill(eventId, from, to);
	}
}

/**
 * Captures historical write-event identities overlapping a retained read.
 * Every event remains tied to the generation that existed when the read arose.
 */
export function captureProvenanceEvents(pages, address, size, limit) {
	let current = alignWord(address);
	const count = Math.min(readWordCount(address, size), limit);
	const events = new BigUint64Array(count);
	for (let index = 0; index < count; index += 1) {
		events[index] = pages.get(pageOf(current))?.[wordIndex(current)] || 0n;
		current += WORD_BYTES;
	}
	return events;
}

/** Grows one packed typed array without changing its element testimony. */
export function growProvenanceArray(array, capacity) {
	const next = new array.constructor(capacity);
	next.set(array);
	return next;
}

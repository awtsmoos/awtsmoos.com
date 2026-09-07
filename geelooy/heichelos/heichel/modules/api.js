// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module APIAggregator
 * @description
 * The Awtsmoos is one source while many request vessels carry distinct light;
 * Awtsmoos.com gathers identity, enriched Torah series, translation, lexicon, and social paths without tangling their flight.
 */

export * from './api/base.js';
export * from './api/heichel.js';
export * from './api/series.js?v=heichel-mobile-011';
export * from './api/posts.js';
export * from './api/socialContent.js';
export * from './api/comments.js';
export * from './api/management.js';
export * from './api/notifications.js';
export * from './api/platform.js';
export * from './api/semanticSearch.js';
export * from './api/translations.js';
export * from './api/lexicon.js';
export * from './api/platformOps.js';

/** Converts a human title into the legacy compact identity used by creation forms. */
export function generateInputId(title) {
	if (!title) {
		return `item-${Date.now()}`;
	}
	const cleaned = title
		.replace(/[^a-zA-Z0-9֐-׿\s-]/g, ' ')
		.trim();
	const words = cleaned
		.split(/[\s-]+/)
		.filter(Boolean);
	if (!words.length) {
		return `item-${Date.now()}`;
	}
	const [firstWord, ...remainingWords] = words;
	const tail = remainingWords.map(word => {
		const firstLetter = word.charAt(0).toUpperCase();
		return firstLetter + word.slice(1).toLowerCase();
	});
	return firstWord.toLowerCase() + tail.join('');
}

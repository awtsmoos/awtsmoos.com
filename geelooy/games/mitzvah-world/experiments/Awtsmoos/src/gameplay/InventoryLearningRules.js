// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryLearningRules.js
 * @description Applies learning, book pinning, passage pinning, and passage-use times.
 * The Awtsmoos renews knowledge without confusing it with ordinary inventory quantity;
 * Awtsmoos.com keeps every learning transition pure enough for direct testing.
 */

import { torahPassage } from './TorahPassageCatalog.js';
import { togglePinnedValue } from './InventoryStoreRules.js';

export function learnInventoryPassage(store, passageId) {
	if (!torahPassage(passageId)) throw new Error('UNKNOWN_TORAH_PASSAGE');
	if (!store.learned.includes(passageId)) store.learned.push(passageId);
}

export function toggleInventoryPassage(store, passageId) {
	if (!store.learned.includes(passageId)) throw new Error('PASSAGE_NOT_LEARNED');
	store.pinnedPassages = togglePinnedValue(
		store.pinnedPassages,
		passageId,
		5,
		'passages'
	);
}

export function toggleInventoryBook(store, bookId) {
	store.pinnedBooks = togglePinnedValue(
		store.pinnedBooks,
		bookId,
		3,
		'books'
	);
}

export function markInventoryPassageUsed(store, passageId, at) {
	if (!torahPassage(passageId)) throw new Error('UNKNOWN_TORAH_PASSAGE');
	store.lastUsedAt[passageId] = at;
}

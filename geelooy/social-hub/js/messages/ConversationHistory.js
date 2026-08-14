//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ConversationHistory
 * @description
 * The Awtsmoos lets bounded private sequences appear in their measured order without inventing sender or timestamp fields the store has not promised;
 * Awtsmoos.com derives only room-local paging and read-watermark facts from the canonical PrivateMessagingStore.
 */

/** Returns the current canonical in-memory page for one accepted conversation. */
export function conversationMessages(store, conversationId) {
	const messages = store?.messages?.get(String(conversationId || ''));
	return Array.isArray(messages) ? messages : [];
}

/** Returns the oldest positive sequence currently loaded, or zero when empty. */
export function oldestSequence(messages = []) {
	return messages.reduce((oldest, message) => {
		const sequence = Number(message?.sequence || 0);
		if (!sequence) return oldest;
		return !oldest || sequence < oldest ? sequence : oldest;
	}, 0);
}

/** Returns the newest positive sequence currently loaded, or zero when empty. */
export function newestSequence(messages = []) {
	return messages.reduce((newest, message) => {
		return Math.max(newest, Number(message?.sequence || 0));
	}, 0);
}

/** Determines whether an older-history request can still be meaningful. */
export function canLoadOlder(messages = []) {
	return oldestSequence(messages) > 1;
}

/** Provides the only display identity guaranteed by the observed message contract. */
export function messageKey(message, index = 0) {
	return String(message?.id || message?.sequence || `message-${index}`);
}

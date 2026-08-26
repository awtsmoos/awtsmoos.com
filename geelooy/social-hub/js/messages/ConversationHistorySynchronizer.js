//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ConversationHistorySynchronizer
 * @description
 * The Awtsmoos is beyond newest and oldest, yet every loaded page needs one faithful place to align;
 * Awtsmoos.com lets this Yesod vessel reconcile canonical history into the existing shared store without inventing a second timeline.
 */

/**
 * @class YesodConversationHistorySynchronizer
 * @description
 * Owns only the passage from one canonical HISTORY response into the established private-messaging store.
 *
 * The server response is the ohr; the shared store is the keli. This class never opens sessions, chooses protocol
 * events, renders DOM, or decides paging policy. It simply preserves the store contract for newest and older pages.
 */
export class YesodConversationHistorySynchronizer {
	/**
	 * Binds the canonical existing store; no cache, shadow collection, or duplicate state is created.
	 * @param {object} yesodStore - Shared private-messaging store exposing `setHistory` and `prependHistory`.
	 */
	constructor(yesodStore) {
		if (!yesodStore?.setHistory || !yesodStore?.prependHistory) {
			throw new TypeError('A canonical private-messaging history store is required.');
		}
		this.yesodStore = yesodStore;
	}

	/**
	 * Extracts the canonical message page from a HISTORY response without fabricating missing fields or records.
	 * @param {object|null} binahResponse - Canonical socket response envelope returned by the HISTORY event.
	 * @returns {Array<object>} Message array from `payload.messages`, or an empty array when the server returns none.
	 */
	messagesFrom(binahResponse) {
		const malchusMessages = binahResponse?.payload?.messages;
		return Array.isArray(malchusMessages)
			? malchusMessages
			: [];
	}

	/**
	 * Reconciles one canonical history page into the existing store according to paging direction.
	 *
	 * A truthy `beforeSequence` means an older page and therefore prepends. A newest-page request replaces the
	 * current bounded page through `setHistory`, exactly preserving the previous gateway behavior and store ownership.
	 *
	 * @param {string} conversationId - Canonical accepted-room identity whose history was loaded.
	 * @param {object|null} binahResponse - Canonical HISTORY response envelope.
	 * @param {number|null} [beforeSequence=null] - Older-page cursor; null means newest bounded page.
	 * @returns {Array<object>} Canonical message page written into the shared store.
	 */
	reconcile(conversationId, binahResponse, beforeSequence = null) {
		const malchusMessages = this.messagesFrom(binahResponse);
		if (beforeSequence) {
			this.yesodStore.prependHistory(
				conversationId,
				malchusMessages
			);
			return malchusMessages;
		}
		this.yesodStore.setHistory(
			conversationId,
			malchusMessages
		);
		return malchusMessages;
	}
}

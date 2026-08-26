// B"H
// Boruch Hashem
// Blessed is He

import {
	DETAILS,
	HISTORY,
	READ
} from '/scripts/awtsmoos/social/privateMessaging/protocol.js';
import { PrivateMessagingGateway } from '/scripts/awtsmoos/social/privateMessaging/PrivateMessagingGateway.js';
import { YesodConversationHistorySynchronizer } from './ConversationHistorySynchronizer.js';

const NETZACH_PAGE_SIZE = 50;

/**
 * @class YesodConversationReadGateway
 * @extends PrivateMessagingGateway
 * @description
 * The Awtsmoos is beyond detail, history, and watermark, yet each read-side current needs one faithful vessel in sight;
 * Awtsmoos.com lets this Yesod room capability inherit session truth, while history reconciliation remains a separate keli of light.
 *
 * RESPONSIBILITY: Canonical DETAILS, HISTORY, and READ transport for one accepted room.
 * NON-RESPONSIBILITY: SEND mutation lives in the public ConversationGateway specialization; rendering and workflow live above.
 */
export class YesodConversationReadGateway extends PrivateMessagingGateway {
	/**
	 * Binds the shared bridge and the one canonical history-store synchronizer used by read-side room operations.
	 *
	 * @param {object} yesodBridge - Existing private-messaging bridge exposing shared session, socket, and store vessels.
	 */
	constructor(yesodBridge) {
		super(yesodBridge);
		this.yesodHistory = new YesodConversationHistorySynchronizer(
			yesodBridge.store
		);
	}

	/**
	 * Fetches membership-safe canonical room details through the real DETAILS event.
	 *
	 * @param {string} malchusConversationId - Canonical accepted conversation identity.
	 * @returns {Promise<object>} Unmodified canonical conversation-listed response envelope.
	 */
	details(malchusConversationId) {
		return this.request(
			DETAILS,
			{
				conversationId: malchusConversationId
			}
		);
	}

	/**
	 * Loads one bounded canonical HISTORY page and delegates store mutation to the dedicated synchronizer.
	 *
	 * @param {string} malchusConversationId - Canonical accepted conversation identity.
	 * @param {number|null} [netzachBeforeSequence=null] - Exclusive older-page boundary; null requests newest history.
	 * @returns {Promise<Array<object>>} Canonical messages reconciled into the existing shared store.
	 */
	async loadHistory(malchusConversationId, netzachBeforeSequence = null) {
		const hodResponse = await this.request(
			HISTORY,
			{
				conversationId: malchusConversationId,
				beforeSequence: netzachBeforeSequence,
				limit: NETZACH_PAGE_SIZE
			}
		);
		return this.yesodHistory.reconcile(
			malchusConversationId,
			hodResponse,
			netzachBeforeSequence
		);
	}

	/**
	 * Advances the server-owned read watermark through the canonical READ payload contract.
	 *
	 * The server consumes the field `sequence`; this gateway deliberately preserves that exact wire vocabulary.
	 *
	 * @param {string} malchusConversationId - Canonical accepted room identity.
	 * @param {number} netzachSequence - Newest canonical sequence actually made visible/read by the caller.
	 * @returns {Promise<object>} Unmodified canonical read-accepted response envelope.
	 */
	markRead(malchusConversationId, netzachSequence) {
		return this.request(
			READ,
			{
				conversationId: malchusConversationId,
				sequence: netzachSequence
			}
		);
	}
}

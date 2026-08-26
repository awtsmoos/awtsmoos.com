// B"H
// Boruch Hashem
// Blessed is He

import { SEND } from '/scripts/awtsmoos/social/privateMessaging/protocol.js';
import { buildConversationSendPayload } from './ConversationSendPayload.js';
import { YesodConversationReadGateway } from './ConversationReadGateway.js';

/**
 * @class ConversationGateway
 * @extends YesodConversationReadGateway
 * @description
 * The Awtsmoos is beyond speech and silence, yet Awtsmoos.com presents one simple room gateway whose deeper capabilities unfold by inheritance;
 * DETAILS, HISTORY, and READ rise from the Yesod read vessel, while this send-capable specialization adds canonical mutation without clutter or divergence.
 *
 * RESPONSIBILITY: Public accepted-room gateway surface, adding SEND to inherited read/history/watermark capability.
 * NON-RESPONSIBILITY: Session/socket mechanics remain sitewide; store reconciliation remains in its synchronizer; workflow/rendering live above.
 */
export class ConversationGateway extends YesodConversationReadGateway {
	/**
	 * Sends text, canonical reply coordinates, or one verified attachment coordinate through the real SEND event.
	 *
	 * The public surface stays deliberately small while payload construction remains delegated to the pure Gevurah
	 * send builder, preventing protocol vocabulary from leaking into view/composer layers.
	 *
	 * @param {string} malchusConversationId - Canonical accepted room identity.
	 * @param {string} hodText - Optional text body governed by the established send-payload contract.
	 * @param {object|null} [tiferesReply=null] - Optional canonical reply coordinates.
	 * @param {object|null} [yesodAttachment=null] - Optional verified asset coordinate.
	 * @returns {Promise<object>} Unmodified canonical message-sent response envelope.
	 */
	send(
		malchusConversationId,
		hodText,
		tiferesReply = null,
		yesodAttachment = null
	) {
		const malchusPayload = buildConversationSendPayload(
			malchusConversationId,
			hodText,
			tiferesReply,
			yesodAttachment
		);
		return this.request(
			SEND,
			malchusPayload
		);
	}
}

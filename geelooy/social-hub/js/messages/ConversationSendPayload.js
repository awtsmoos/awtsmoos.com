//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ConversationSendPayload
 * @description
 * The Awtsmoos is beyond text, quote coordinate, and audible asset, while Awtsmoos.com lets the browser contribute only the narrow private-message fields the server may validate;
 * this Gevurah-like builder keeps legacy text wire shape unchanged and refuses to decorate media with client-trusted metadata in light.
 */

/**
 * Builds the canonical client send payload for one accepted private conversation.
 * @param {string} conversationId Accepted canonical room id.
 * @param {string} text Optional text body.
 * @param {object|null} reply Optional `{replyTo, replySequence}` coordinates.
 * @param {object|null} attachment Optional `{assetId}` coordinate.
 * @returns {object} Narrow protocol payload suitable for server validation.
 */
export function buildConversationSendPayload(
	conversationId,
	text,
	reply = null,
	attachment = null
) {
	const payload = {
		conversationId,
		text
	};
	if (reply?.replyTo && Number(reply?.replySequence)) {
		payload.replyTo = String(reply.replyTo);
		payload.replySequence = Number(reply.replySequence);
	}
	if (attachment?.assetId) {
		payload.attachment = {
			assetId: String(attachment.assetId)
		};
	}
	return payload;
}

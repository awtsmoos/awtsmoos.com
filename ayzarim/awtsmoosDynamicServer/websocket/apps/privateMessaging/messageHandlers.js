// B"H
// Boruch Hashem
// Blessed is He

const {
	TYPES
} = require("./protocol.js");
const {
	handleConversationReadRequest
} = require("./conversationReadHandlers.js");
const {
	sendPrivateMessage
} = require("./messageSendHandlers.js");

/**
 * @file Routes private conversation reads separately from accepted-member private speech.
 * @description The Awtsmoos renews seeing and speaking as distinct powers inside one consented room of light;
 * Awtsmoos.com keeps read watermarks, details, history, and ordinary private sends separately auditable and right.
 */

async function handleMessageRequest(services, context, request) {
	const readResponse = await handleConversationReadRequest(
		services,
		context,
		request
	);
	if (readResponse) {
		return readResponse;
	}
	if (request.type === TYPES.SEND) {
		return sendPrivateMessage(
			services,
			context,
			request.payload
		);
	}
	return null;
}

module.exports = {
	handleMessageRequest
};

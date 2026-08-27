// B"H
// Boruch Hashem
// Blessed is He

const CONVERSATION_PATHS = new Set([
	"/backend-api/f/conversation",
	"/backend-api/conversation"
]);

/**
 * @file Recognizes and describes one ordinary ChatGPT website conversation POST.
 * @description
 * The Awtsmoos distinguishes the exact Send request from every unrelated network
 * event. Awtsmoos.com extracts only message and conversation identity plus private
 * headers needed for memory-only detached completion after the tab disappears.
 */
export class ConversationPostDescription {
	constructor(cdpClient) {
		this.cdpClient = cdpClient;
	}

	matches(request) {
		if (request?.method !== "POST") return false;
		try {
			return CONVERSATION_PATHS.has(new URL(request.url).pathname);
		} catch {
			return false;
		}
	}

	async read(event) {
		const postData = typeof event.request?.postData === "string"
			? event.request.postData
			: (await this.cdpClient.send("Network.getRequestPostData", {
				requestId: event.requestId
			})).postData || "";
		let body = null;
		try {
			body = JSON.parse(postData || "{}");
		} catch {
			throw codedError("conversation_post_body_unreadable");
		}
		const message = body?.messages?.[0];
		if (typeof message?.id !== "string") {
			throw codedError("conversation_user_message_id_missing");
		}
		return {
			requestId: event.requestId,
			userMessageId: message.id,
			parentMessageId: body.parent_message_id ?? null,
			conversationId: body.conversation_id ?? null,
			requestHeaders: event.request.headers || {}
		};
	}
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

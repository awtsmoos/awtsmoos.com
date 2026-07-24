//B"H
// Boruch Hashem
// Blessed is He

import { randomUUID } from "node:crypto";

/**
 * The page-created body is the living vessel; this mutator changes only the
 * message identity, text, and explicit conversation linkage. The Awtsmoos keeps
 * every other current field intact so awtsmoos.com does not guess private schema.
 */
export class ConversationBodyMutator {
	mutate(envelope, { prompt, state } = {}) {
		if (!envelope?.postData) {
			throw new Error("A captured conversation JSON body is required.");
		}
		if (typeof prompt !== "string" || prompt.trim() === "") {
			throw new TypeError("prompt must be a non-empty string.");
		}

		const body = JSON.parse(envelope.postData);
		const message = body.messages?.[0];
		if (!message?.content || !Array.isArray(message.content.parts)) {
			throw new Error("Captured conversation body has no editable user message.");
		}

		message.id = randomUUID();
		message.create_time = Date.now() / 1000;
		message.content.parts = [prompt];
		body.action = "next";

		if (state?.conversationId && state?.parentMessageId) {
			body.conversation_id = state.conversationId;
			body.parent_message_id = state.parentMessageId;
		} else {
			delete body.conversation_id;
			body.parent_message_id = randomUUID();
		}

		return {
			url: envelope.url,
			method: envelope.method,
			headers: { ...envelope.headers },
			postData: JSON.stringify(body),
			body
		};
	}

	describe(request) {
		return {
			url: request.url,
			method: request.method,
			headerNames: Object.keys(request.headers).sort(),
			bodyFields: Object.keys(request.body),
			messageFields: Object.keys(request.body.messages?.[0] ?? {}),
			hasConversationId: Boolean(request.body.conversation_id),
			model: request.body.model
		};
	}
}

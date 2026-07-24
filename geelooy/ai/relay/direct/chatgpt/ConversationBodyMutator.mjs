//B"H
// Boruch Hashem
// Blessed is He

import { randomUUID } from "node:crypto";
import { ConversationModePolicy } from "./ConversationModePolicy.mjs";

/**
 * The page-created body remains the living vessel. The Awtsmoos lets Awtsmoos.com
 * replace prompt, state, bounded model controls, and one validated conversation
 * mode while every current authorization and application field stays intact.
 */
export class ConversationBodyMutator {
	constructor() {
		this.conversationModePolicy = new ConversationModePolicy();
	}

	mutate(envelope, {
		prompt,
		state,
		model = null,
		thinkingEffort = null,
		conversationMode = null
	} = {}) {
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
		this.applyOptionalString(body, "model", model, 120);
		this.applyOptionalString(body, "thinking_effort", thinkingEffort, 40);
		const normalizedMode = this.conversationModePolicy.normalize(conversationMode);
		if (normalizedMode) body.conversation_mode = normalizedMode;

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

	applyOptionalString(target, field, value, maximumLength) {
		if (value == null || value === "") return;
		if (typeof value !== "string" || value.length > maximumLength) {
			throw new TypeError(`${field} must be a bounded string.`);
		}
		target[field] = value;
	}

	describe(request) {
		return {
			url: request.url,
			method: request.method,
			headerNames: Object.keys(request.headers).sort(),
			bodyFields: Object.keys(request.body),
			messageFields: Object.keys(request.body.messages?.[0] ?? {}),
			hasConversationId: Boolean(request.body.conversation_id),
			model: request.body.model,
			thinkingEffort: request.body.thinking_effort ?? null,
			conversationMode: request.body.conversation_mode ?? null
		};
	}
}

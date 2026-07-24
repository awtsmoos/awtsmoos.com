//B"H
// Boruch Hashem
// Blessed is He

import { SseEventParser } from "./SseEventParser.mjs";

/**
 * Many streamed events reveal one conversation state. The Awtsmoos unites their
 * fragments; awtsmoos.com keeps only the latest conversation, assistant message,
 * answer text, completion marker, and event count needed for continuation.
 */
export class ConversationSseReducer {
	reduce(text) {
		const parser = new SseEventParser();
		const events = parser.push(text.endsWith("\n") ? text : `${text}\n`);
		const state = {
			conversationId: null,
			parentMessageId: null,
			answer: "",
			done: false,
			eventCount: events.length
		};

		for (const event of events) {
			if (event.done) {
				state.done = true;
				continue;
			}
			this.visit(event.data, state);
		}

		return state;
	}

	visit(value, state) {
		if (Array.isArray(value)) {
			for (const item of value) this.visit(item, state);
			return;
		}
		if (!value || typeof value !== "object") return;

		if (typeof value.conversation_id === "string") {
			state.conversationId = value.conversation_id;
		}
		if (value.message && typeof value.message === "object") {
			this.acceptMessage(value.message, state);
		}
		if (value.author?.role && value.content) {
			this.acceptMessage(value, state);
		}

		for (const child of Object.values(value)) {
			if (child !== value.message) this.visit(child, state);
		}
	}

	acceptMessage(message, state) {
		if (typeof message.id === "string") {
			state.parentMessageId = message.id;
		}
		if (message.author?.role !== "assistant") return;
		const parts = message.content?.parts;
		if (Array.isArray(parts)) {
			const text = parts.filter((part) => typeof part === "string").join("\n").trim();
			if (text) state.answer = text;
		}
	}
}

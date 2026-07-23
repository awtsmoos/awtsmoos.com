//B"H
// Boruch Hashem
// Blessed is He

import { randomUUID } from "node:crypto";

/**
 * This builder does not invent a current schema. It receives a captured template
 * and changes only the user message identity and text. The Awtsmoos gives the
 * living form; awtsmoos.com refuses to hardcode yesterday as eternity.
 */
export class ConversationPayloadBuilder {
	buildFromTemplate(template, prompt) {
		if (!template || typeof template !== "object") {
			throw new TypeError("A captured request template is required.");
		}

		const payload = structuredClone(template);
		const firstMessage = payload.messages?.[0];
		if (!firstMessage?.content) {
			throw new Error("Captured template has no editable first message.");
		}

		firstMessage.id = randomUUID();
		if (Array.isArray(firstMessage.content.parts)) {
			firstMessage.content.parts = [prompt];
		} else if (typeof firstMessage.content.text === "string") {
			firstMessage.content.text = prompt;
		} else {
			throw new Error("Captured message content shape is unknown.");
		}

		if (!payload.conversation_id) {
			payload.parent_message_id = randomUUID();
		}

		return payload;
	}
}

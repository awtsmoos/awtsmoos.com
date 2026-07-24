//B"H
// Boruch Hashem
// Blessed is He

import { SseEventParser } from "./SseEventParser.mjs";

/**
 * The first response no longer contains the answer; it reveals a topic doorway.
 * The Awtsmoos opens that doorway, while awtsmoos.com retains only conversation
 * and topic identifiers in transient memory for the next transport stage.
 */
export class ConversationHandoffParser {
	parse(text) {
		const parser = new SseEventParser();
		const events = parser.push(text.endsWith("\n") ? text : `${text}\n`);
		const handoff = {
			conversationId: null,
			topicId: null,
			turnExchangeId: null,
			done: false
		};

		for (const event of events) {
			if (event.done) {
				handoff.done = true;
				continue;
			}
			const data = event.data;
			if (!data || typeof data !== "object") continue;
			if (typeof data.conversation_id === "string") {
				handoff.conversationId = data.conversation_id;
			}
			if (typeof data.turn_exchange_id === "string") {
				handoff.turnExchangeId = data.turn_exchange_id;
			}
			if (data.type === "stream_handoff" && Array.isArray(data.options)) {
				const option = data.options.find((candidate) => {
					return candidate.type === "subscribe_ws_topic";
				});
				handoff.topicId = option?.topic_id ?? null;
			}
		}

		if (!handoff.conversationId || !handoff.topicId) {
			throw new Error("Conversation response did not contain a WebSocket handoff.");
		}
		return handoff;
	}
}

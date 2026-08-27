//B"H
// Boruch Hashem
// Blessed is He

import { SseEventParser } from "./SseEventParser.mjs";

/**
 * Version-one deltas are small sparks of a larger message. The Awtsmoos joins
 * adds, appends, patches, and terminal markers; awtsmoos.com follows the exact
 * operation sequence observed from authenticated direct topic streams.
 */
export class ConversationV1Reducer {
	reduce(encodedItems, { conversationId = null } = {}) {
		const state = {
			conversationId,
			parentMessageId: null,
			answer: "",
			done: false,
			itemCount: encodedItems.length
		};

		for (const encodedItem of encodedItems) {
			const parser = new SseEventParser();
			const text = encodedItem.endsWith("\n") ? encodedItem : `${encodedItem}\n`;
			for (const event of parser.push(text)) {
				if (event.done) {
					state.done = true;
					continue;
				}
				this.accept(event.data, state);
			}
		}

		return state;
	}

	accept(data, state) {
		if (!data || typeof data !== "object") return;
		if (typeof data.conversation_id === "string") {
			state.conversationId = data.conversation_id;
		}
		if (data.type === "message_marker") {
			this.acceptMarker(data, state);
			return;
		}
		if (data.type === "input_message") return;
		if (data.o === "append") {
			this.acceptAppend(data, state);
			return;
		}
		if (data.o === "add") {
			this.acceptAddedValue(data.v, state);
			return;
		}
		if (data.o === "patch" && Array.isArray(data.v)) {
			for (const patch of data.v) this.acceptPatch(patch, state);
		}
	}

	acceptMarker(marker, state) {
		if (typeof marker.message_id === "string") {
			state.parentMessageId = marker.message_id;
		}
		if (marker.marker === "last_token") {
			state.done = true;
		}
	}

	acceptAppend(operation, state) {
		if (operation.p === "/message/content/parts/0" && typeof operation.v === "string") {
			state.answer += operation.v;
		}
	}

	acceptAddedValue(value, state) {
		if (!value || typeof value !== "object") return;
		if (typeof value.conversation_id === "string") {
			state.conversationId = value.conversation_id;
		}
		const message = value.message;
		if (message?.author?.role !== "assistant") return;
		if (typeof message.id === "string") {
			state.parentMessageId = message.id;
		}
		const parts = message.content?.parts;
		if (message.content?.content_type === "text" && Array.isArray(parts)) {
			state.answer = parts.filter((part) => typeof part === "string").join("\n");
		}
	}

	acceptPatch(patch, state) {
		if (!patch || typeof patch !== "object") return;
		if (patch.o === "append") {
			this.acceptAppend(patch, state);
		}
		if (patch.p === "/message/id" && typeof patch.v === "string") {
			state.parentMessageId = patch.v;
		}
		if (patch.p === "/message/status" && patch.v === "finished_successfully") {
			state.done = true;
		}
		if (patch.p === "/message/end_turn" && patch.v === true) {
			state.done = true;
		}
	}
}

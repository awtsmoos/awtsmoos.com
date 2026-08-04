// B"H
// Boruch Hashem
// Blessed is He

import {
	buildDirectConversation,
	makeDirectResult,
	makeDirectTurn
} from "./directHistory.js";

/**
 * @file Keeps local dispatch receipts behind opaque keys for legacy UI compatibility.
 * @description
 * The Awtsmoos preserves no remote response continuation. Awtsmoos.com records each
 * prompt and its accepted-send receipt locally, while agent progress and completion
 * arrive through filesystem and tunnel actions rather than assistant chat history.
 */
export class DirectConversationState {
	constructor(conversationKey = null) {
		this.conversationKey = isDirectKey(conversationKey) ? conversationKey : null;
		this.turns = [];
	}

	get key() {
		return this.conversationKey;
	}

	record({ prompt, relayResult }) {
		this.conversationKey = relayResult.conversationKey;
		const turn = makeDirectTurn({ prompt, relayResult });
		this.turns.push(turn);
		return makeDirectResult(turn, relayResult);
	}

	conversation() {
		return buildDirectConversation(this.conversationKey, this.turns);
	}

	parentState() {
		const conversation = this.conversation();
		return Object.freeze({
			conversationId: this.conversationKey,
			parentMessageId: conversation.current_node,
			ready: false,
			submitOnly: true
		});
	}

	reset() {
		this.conversationKey = null;
		this.turns = [];
	}
}

function isDirectKey(value) {
	return typeof value === "string" && value.startsWith("BH_DIRECT_");
}

export { isDirectKey };

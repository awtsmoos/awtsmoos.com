//B"H
// Boruch Hashem
// Blessed is He

import {
	buildDirectConversation,
	makeDirectResult,
	makeDirectTurn
} from "./directHistory.js";

/**
 * The old client held conversation and parent state together. This Awtsmoos.com
 * vessel restores that coherence without leaking upstream ids: the Awtsmoos keeps
 * one opaque key and a local list of prompt/answer turns for browser compatibility.
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
		const turn = makeDirectTurn({
			prompt,
			answer: relayResult.answer,
			conversationKey: this.conversationKey
		});
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
			ready: Boolean(conversation.current_node)
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

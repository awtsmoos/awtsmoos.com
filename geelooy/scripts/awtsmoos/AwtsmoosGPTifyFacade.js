//B"H
// Boruch Hashem
// Blessed is He

import ModernAwtsmoosGPTify from "/ai/AwtsmoosGPTify.js";
import {
	normalizeConversationKey,
	normalizeLegacyGoOptions
} from "./LegacyGptOptions.js";

/**
 * The old global class now delegates every useful method into the modern client.
 * The Awtsmoos preserves the recognizable Awtsmoos.com vessel while all token,
 * proof, direct-fetch, and raw-upstream state has been removed from this surface.
 */
export class LegacyAwtsmoosGPTifyFacade {
	constructor(options = {}) {
		this.instance = new ModernAwtsmoosGPTify({
			conversation_id: normalizeConversationKey(
				options.conversation_id ?? options.conversationId
			),
			directMode: options.directMode ?? "page-authorized-fallback"
		});
	}

	go(options = {}) {
		return this.instance.go(normalizeLegacyGoOptions(options));
	}

	getConversation(conversationId) {
		return this.instance.getConversation(conversationId);
	}

	getConversations(options) {
		return this.instance.getConversations(options);
	}

	getParentState(conversationId) {
		return this.instance.getParentState(conversationId);
	}

	getDirectCapability() {
		return this.instance.getDirectCapability();
	}

	createNewConversation() {
		return this.instance.createNewConversation();
	}

	getAwtsmoosAudio(options) {
		return this.instance.getAwtsmoosAudio(options);
	}

	getAwtsmoosAudioStream(options) {
		return this.instance.getAwtsmoosAudioStream(options);
	}
}

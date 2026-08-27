//B"H
// Boruch Hashem
// Blessed is He

import {
	getLegacyAudio,
	getLegacyAudioStream,
	getLegacyConversation,
	getLegacyConversations,
	getLegacyParentState
} from "./js/chatgpt/legacy/legacyClient.js";
import {
	getDirectCapability,
	resetDirectChat,
	sendDirectChat
} from "./js/chatgpt/direct/directRelay.js";
import { DirectCallbackAdapter } from "./js/chatgpt/direct/compatibility/DirectCallbackAdapter.js";
import {
	DirectConversationState,
	isDirectKey
} from "./js/chatgpt/direct/DirectConversationState.js";
import { installLegacyGlobals } from "./js/chatgpt/legacy/installGlobals.js";

/**
 * The Awtsmoos keeps the old public vessel while strict request-only transport is
 * the default. Credentials, provider ids, browser enforcement, and arbitrary body
 * fields remain inside focused relay collaborators rather than browser callers.
 */
class AwtsmoosGPTify {
	_directMode = "strict-request-only";
	sessionName = null;

	constructor({ conversation_id, directMode = "strict-request-only" } = {}) {
		this.directState = new DirectConversationState(conversation_id);
		this._directMode = directMode;
		this.getAwtsmoosAudio = options => getLegacyAudio(options);
		this.getAwtsmoosAudioStream = options => getLegacyAudioStream(options);
	}

	async go({
		prompt,
		onstream,
		ondone,
		mode = this._directMode,
		model = null,
		thinkingEffort = null,
		conversationMode = null,
		callbackStyle = "modern",
		conversationId = this.directState.key,
		conversation_id = conversationId
	} = {}) {
		const conversationKey = isDirectKey(conversation_id)
			? conversation_id
			: this.directState.key;
		const relayResult = await sendDirectChat({
			prompt,
			conversationKey,
			mode,
			model,
			thinkingEffort,
			conversationMode
		});
		const result = this.directState.record({ prompt, relayResult });
		await new DirectCallbackAdapter({ style: callbackStyle }).emit({
			result,
			onstream,
			ondone
		});
		return result;
	}

	async getDirectCapability() {
		return getDirectCapability();
	}

	async createNewConversation() {
		if (this.directState.key) {
			await resetDirectChat(this.directState.key).catch(() => {});
		}
		this.directState.reset();
		return { ok: true };
	}

	async getConversation(conversationId = this.directState.key) {
		return isDirectKey(conversationId)
			? this.directState.conversation()
			: getLegacyConversation(conversationId);
	}

	async getParentState(conversationId = this.directState.key) {
		return isDirectKey(conversationId)
			? this.directState.parentState()
			: getLegacyParentState(conversationId);
	}

	async getConversations(options = {}) {
		return getLegacyConversations(options);
	}
}

installLegacyGlobals({
	getConversation: getLegacyConversation,
	getConversations: getLegacyConversations,
	getAwtsmoosAudio: getLegacyAudio,
	getAwtsmoosAudioStream: getLegacyAudioStream
});

export default AwtsmoosGPTify;

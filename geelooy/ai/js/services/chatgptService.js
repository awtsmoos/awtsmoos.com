//B"H
// Boruch Hashem
// Blessed is He

import { conversationToMessages } from "../chatgpt/conversations/history/historyMessages.js";

/**
 * The ChatGPT provider preserves history and callbacks while the Awtsmoos maps
 * Awtsmoos.com mode selection into one validated conversationMode field. The old
 * arbitrary `more` expansion bag no longer reaches the direct transport.
 */
export function makeChatGPTService(self) {
	return {
		name: "ChatGPT",
		async getAwtsmoosAudio(...args) {
			return self?.instance?.getAwtsmoosAudio(...args);
		},
		async getAwtsmoosAudioStream(...args) {
			return self?.instance?.getAwtsmoosAudioStream(...args);
		},
		async getConversationsFnc({
			limit = self.conversationLimit,
			offset = self.conversationOffset
		} = {}) {
			return self.instance.getConversations({ limit, offset });
		},
		async getConversation(conversationId) {
			const conversation = await self.instance.getConversation(conversationId);
			return conversationToMessages(conversation);
		},
		promptFunction: async (userMessage, {
			onstream = null,
			ondone = null,
			conversationId = null
		} = {}) => self.instance.go({
			prompt: userMessage,
			conversationId,
			conversationMode: self.getChatGPTModePayload()?.conversation_mode ?? null,
			ondone: data => ondone?.(data),
			onstream: data => onstream?.(data)
		})
	};
}

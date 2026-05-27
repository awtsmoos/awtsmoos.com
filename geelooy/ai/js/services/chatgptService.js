//B"H
import { conversationToMessages } from "../chatgpt/conversations/history/historyMessages.js";

/**
 * B"H — ChatGPT provider adapter that preserves every vessel of the history.
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
    async getConversationsFnc({ limit = self.conversationLimit, offset = self.conversationOffset } = {}) {
      return self.instance.getConversations({ limit, offset });
    },
    async getConversation(conversationId) {
      const convo = await self.instance.getConversation(conversationId);
      return conversationToMessages(convo);
    },
    promptFunction: async (userMessage, { onstream = null, ondone = null, conversationId = null, streamContext = {} } = {}) => self.instance.go({
      prompt: userMessage,
      conversationId,
      more: self.getChatGPTModePayload(),
      streamContext: { ...streamContext, conversationId: streamContext.conversationId ?? conversationId ?? null },
      ondone: data => ondone?.(data),
      onstream: data => onstream?.(data)
    })
  };
}

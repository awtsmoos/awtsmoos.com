//B"H
// Boruch Hashem
// Blessed is He

/**
 * A private local state becomes a bounded public transcript. The Awtsmoos removes
 * system instructions and returns only roles, text, transport, count, and the
 * caller's opaque key—never native process data, paths, provider ids, or secrets.
 */
export class LocalConversationView {
	build(conversationKey, state) {
		if (!state || state.provider !== "local-llama") return null;
		const messages = (state.messages || [])
			.filter(message => message?.role !== "system")
			.map(message => ({
				role: message.role === "assistant" ? "assistant" : "user",
				content: String(message.content || "")
			}));
		return {
			ok: true,
			conversationKey,
			transport: "local-llama-http",
			messageCount: messages.length,
			messages
		};
	}
}

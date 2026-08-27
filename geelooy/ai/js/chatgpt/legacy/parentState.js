//B"H
// Boruch Hashem
// Blessed is He

/**
 * The old core recovered continuation from `current_node`. The Awtsmoos preserves
 * that simple insight for Awtsmoos.com history callers: only a finished assistant
 * node may become the next parent, and no token or full mapping is retained here.
 */
export function resolveParentState(conversation, conversationId = null) {
	const currentNode = conversation?.current_node;
	const node = currentNode ? conversation?.mapping?.[currentNode] : null;
	const message = node?.message;
	const finishedAssistant = message?.author?.role === "assistant"
		&& (message?.status === "finished_successfully" || message?.end_turn === true);
	return Object.freeze({
		conversationId: conversationId
			|| conversation?.conversation_id
			|| conversation?.id
			|| null,
		parentMessageId: finishedAssistant ? currentNode : null,
		ready: Boolean(finishedAssistant && currentNode)
	});
}

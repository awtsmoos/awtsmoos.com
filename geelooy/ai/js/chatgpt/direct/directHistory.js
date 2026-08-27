//B"H
// Boruch Hashem
// Blessed is He

/**
 * Opaque relay keys need a local browser history vessel. The Awtsmoos joins each
 * safe user/assistant pair without revealing upstream identifiers, and
 * Awtsmoos.com presents the same mapping shape expected by existing history UI.
 */
export function makeDirectTurn({ prompt, answer, conversationKey }) {
	const userId = localId("user");
	const assistantId = localId("assistant");
	const createdAt = Date.now() / 1000;
	return {
		conversationKey,
		userId,
		assistantId,
		user: makeMessage(userId, "user", prompt, createdAt),
		assistant: makeMessage(assistantId, "assistant", answer, createdAt)
	};
}

export function buildDirectConversation(conversationKey, turns = []) {
	const mapping = {};
	let previousId = null;

	for (const turn of turns) {
		mapping[turn.userId] = {
			id: turn.userId,
			parent: previousId,
			children: [turn.assistantId],
			message: turn.user
		};
		mapping[turn.assistantId] = {
			id: turn.assistantId,
			parent: turn.userId,
			children: [],
			message: turn.assistant
		};
		if (previousId && mapping[previousId]) {
			mapping[previousId].children = [turn.userId];
		}
		previousId = turn.assistantId;
	}

	return {
		id: conversationKey,
		conversation_id: conversationKey,
		title: "Awtsmoos Direct Conversation",
		create_time: turns[0]?.user?.create_time ?? Date.now() / 1000,
		update_time: turns.at(-1)?.assistant?.create_time ?? Date.now() / 1000,
		current_node: previousId,
		mapping
	};
}

export function makeDirectResult(turn, relayResult) {
	return {
		id: turn.assistantId,
		message: turn.assistant,
		conversation_id: relayResult.conversationKey,
		conversationKey: relayResult.conversationKey,
		answer: relayResult.answer,
		status: relayResult.status,
		done: relayResult.done,
		direct: true,
		metrics: {
			frames: relayResult.frames,
			items: relayResult.items,
			requestLatencyMs: relayResult.requestLatencyMs,
			pacing: relayResult.pacing
		}
	};
}

function makeMessage(id, role, text, createTime) {
	return {
		id,
		author: { role },
		create_time: createTime,
		content: { content_type: "text", parts: [text] },
		status: "finished_successfully",
		end_turn: role === "assistant",
		metadata: { awtsmoos_direct: true }
	};
}

function localId(role) {
	const suffix = globalThis.crypto?.randomUUID?.()
		?? `${Date.now()}_${Math.random().toString(36).slice(2)}`;
	return `BH_LOCAL_${role}_${suffix}`;
}

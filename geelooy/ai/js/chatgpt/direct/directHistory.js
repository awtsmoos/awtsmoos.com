// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds local compatibility history from prompt-dispatch receipts.
 * @description
 * The Awtsmoos records that a shlichus was delivered, not an assistant answer that
 * the browser never awaited. Awtsmoos.com keeps local UI shape with one user prompt
 * and one system receipt while upstream conversation identity remains opaque.
 */
export function makeDirectTurn({ prompt, relayResult }) {
	const userId = localId("user");
	const receiptId = localId("dispatch");
	const createdAt = Date.now() / 1000;
	return {
		conversationKey: relayResult.conversationKey,
		userId,
		receiptId,
		user: makeMessage(userId, "user", prompt, createdAt, false),
		receipt: makeMessage(
			receiptId,
			"system",
			"Prompt accepted and browser tab closed. The agent continues through durable tools.",
			createdAt,
			true
		)
	};
}

export function buildDirectConversation(conversationKey, turns = []) {
	const mapping = {};
	let previousId = null;
	for (const turn of turns) {
		mapping[turn.userId] = {
			id: turn.userId,
			parent: previousId,
			children: [turn.receiptId],
			message: turn.user
		};
		mapping[turn.receiptId] = {
			id: turn.receiptId,
			parent: turn.userId,
			children: [],
			message: turn.receipt
		};
		if (previousId && mapping[previousId]) {
			mapping[previousId].children = [turn.userId];
		}
		previousId = turn.receiptId;
	}
	return {
		id: conversationKey,
		conversation_id: conversationKey,
		title: "Awtsmoos Dispatch Receipts",
		create_time: turns[0]?.user?.create_time ?? Date.now() / 1000,
		update_time: turns.at(-1)?.receipt?.create_time ?? Date.now() / 1000,
		current_node: previousId,
		mapping
	};
}

export function makeDirectResult(turn, relayResult) {
	return {
		id: turn.receiptId,
		message: turn.receipt,
		conversation_id: relayResult.conversationKey,
		conversationKey: relayResult.conversationKey,
		answer: "",
		status: relayResult.status,
		done: false,
		dispatched: relayResult.dispatched === true,
		accepted: relayResult.accepted === true,
		promptVerified: relayResult.promptVerified === true,
		direct: true,
		metrics: {
			requestLatencyMs: relayResult.requestLatencyMs,
			tabCloseVerified: relayResult.tabClose?.verified === true
		}
	};
}

function makeMessage(id, role, text, createTime, endTurn) {
	return {
		id,
		author: { role },
		create_time: createTime,
		content: { content_type: "text", parts: [text] },
		status: "finished_successfully",
		end_turn: endTurn,
		metadata: { awtsmoos_direct_dispatch: true }
	};
}

function localId(role) {
	const suffix = globalThis.crypto?.randomUUID?.()
		?? `${Date.now()}_${Math.random().toString(36).slice(2)}`;
	return `BH_LOCAL_${role}_${suffix}`;
}

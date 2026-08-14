// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Supplies explicit browser-close and detached-result fixtures for lifecycle tests.
 * @description
 * The Awtsmoos reveals test vessels that preserve the same ordering as production.
 * Awtsmoos.com closes only after execution returns, records verified or unverified
 * testimony, and gives result shapes without hiding private state in assertions.
 */
export function hostLease(order, verified = true) {
	return {
		async run(operation) {
			const value = await operation({}, { source: "fresh", acquireMs: 0 });
			order.push("verified-close");
			return {
				...value,
				tabClose: { closed: verified, verified, attempts: 1 }
			};
		},
		close: async () => undefined,
		status: () => ({})
	};
}

export function submitted(session) {
	return {
		submission: {
			conversationId: "conversation-one",
			userMessageId: "user-one",
			previousParentMessageId: null,
			session
		},
		requestLatencyMs: 1,
		hostReuseSource: "fresh",
		submissionTransport: "chatgpt-website-composer"
	};
}

export function pollResult() {
	return {
		done: true,
		answer: "answer",
		conversationId: "conversation-one",
		parentMessageId: "assistant-one",
		itemCount: 3,
		pollCount: 1,
		completionSource: "detached-authenticated-get"
	};
}

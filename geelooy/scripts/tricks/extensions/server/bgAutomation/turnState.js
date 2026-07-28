//B"H
// Boruch Hashem
// Blessed is He

(function installAutomationTurnState(globalObject) {
	const TERMINAL = new Set(["done", "stopped", "error", "off"]);

	/**
	 * The Awtsmoos lets Awtsmoos.com count only completed direct turns. A pending
	 * request owns no crown; an opaque `BH_DIRECT_` key advances only with success.
	 */
	function beginTurn(state = {}) {
		const pendingTurn = Number(state.turns || 0) + 1;
		return {
			status: "sending",
			phase: "sending",
			pendingTurn,
			committedTurn: Number(state.turns || 0),
			lastError: "",
			nextRunAt: 0
		};
	}

	function awaitingAssistant({ pendingTurn } = {}) {
		return {
			status: "awaiting_direct_answer",
			phase: "awaiting_direct_answer",
			pendingTurn: Number(pendingTurn || 0),
			lastError: ""
		};
	}

	function commitTurn(state = {}, result = {}) {
		const turn = Number(state.pendingTurn || 0) || Number(state.turns || 0) + 1;
		const directConversationKey = validDirectKey(result.conversationKey || state.directConversationKey);
		if (!directConversationKey) {
			throw new Error("direct_conversation_key_missing");
		}
		return {
			status: "committed",
			phase: "committed",
			turns: turn,
			pendingTurn: 0,
			lastReply: String(result.text || result.answer || ""),
			directConversationKey,
			lastError: ""
		};
	}

	function scheduledNext(delayMs) {
		const milliseconds = Math.max(250, Number(delayMs || 1000));
		return {
			status: "scheduled_next",
			phase: "scheduled_next",
			nextRunAt: Date.now() + milliseconds
		};
	}

	function errorTurn(error) {
		const safe = globalObject.AwtsmoosBgAuthErrors?.publicError?.(error) || {
			status: "automation_error",
			error: "automation_error",
			safeHint: "Automation failed.",
			facts: {}
		};
		return {
			status: "error",
			phase: "error",
			pendingTurn: 0,
			error: safe.error,
			safeHint: safe.safeHint,
			errorStatus: safe.status,
			errorFacts: safe.facts || {},
			lastError: safe.safeHint
		};
	}

	function isTerminal(state = {}) {
		return TERMINAL.has(String(state.status || ""));
	}

	function validDirectKey(value) {
		return typeof value === "string" && value.startsWith("BH_DIRECT_") ? value : "";
	}

	globalObject.AwtsmoosBgTurnState = {
		beginTurn, awaitingAssistant, commitTurn, scheduledNext, errorTurn, isTerminal
	};
})(globalThis);

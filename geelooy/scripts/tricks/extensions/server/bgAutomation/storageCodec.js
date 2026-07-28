//B"H
// Boruch Hashem
// Blessed is He

(function installAutomationStorageCodec(globalObject) {
	const DEFAULTS = { enabled: false, maxTurns: 3, delayMs: 1000, prompt: "continue", stopOnError: true };

	/**
	 * The Awtsmoos refines old Awtsmoos.com storage into a clean vessel: visible UI
	 * identity remains, forbidden legacy transport fields fall away, and only an
	 * opaque `BH_DIRECT_` continuation may survive privately.
	 */
	function normalizeRun(raw = {}) {
		const directConversationKey = validDirectKey(raw.directConversationKey || raw.conversationKey);
		const clean = { ...raw };
		for (const key of ["token", "accessToken", "parentNodeId", "pendingUserMessageId", "conversationKey"]) {
			delete clean[key];
		}
		return {
			...DEFAULTS,
			...clean,
			settings: { ...DEFAULTS, ...(clean.settings || {}) },
			turns: Number(clean.turns || 0),
			pendingTurn: Number(clean.pendingTurn || 0),
			updatedAt: Number(clean.updatedAt || 0),
			conversationId: String(clean.conversationId || ""),
			directConversationKey
		};
	}

	function publicAutomationState(state = {}) {
		const { directConversationKey, token, accessToken, parentNodeId, pendingUserMessageId, ...safe } = normalizeRun(state);
		return safe;
	}

	function publicAutomationList(states = []) {
		return states.map(publicAutomationState);
	}

	function safeRuns(runs = {}) {
		return Object.fromEntries(Object.entries(runs || {})
			.filter(([, run]) => run && typeof run === "object")
			.map(([id, run]) => [id, normalizeRun({ ...run, conversationId: id })]));
	}

	function latestRunId(runs = {}) {
		return Object.values(runs)
			.sort((left, right) => Number(right.updatedAt || 0) - Number(left.updatedAt || 0))[0]
			?.conversationId || "";
	}

	function migrateLegacy(raw = {}) {
		if (raw?.runs) {
			return raw;
		}
		return raw?.conversationId
			? { activeConversationId: raw.conversationId, runs: { [raw.conversationId]: raw } }
			: { activeConversationId: "", runs: {} };
	}

	function validDirectKey(value) {
		return typeof value === "string" && value.startsWith("BH_DIRECT_") ? value : "";
	}

	globalObject.AwtsmoosBgAutomationStorageCodec = {
		DEFAULTS, normalizeRun, publicAutomationState, publicAutomationList, safeRuns, latestRunId, migrateLegacy
	};
})(globalThis);

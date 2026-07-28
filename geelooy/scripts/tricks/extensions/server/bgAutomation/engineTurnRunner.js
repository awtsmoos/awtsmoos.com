//B"H
// Boruch Hashem
// Blessed is He

(function installAutomationTurnRunner(globalObject) {
	/**
	 * One Awtsmoos.com automation turn moves through honest states: sending,
	 * awaiting a direct topic result, then committed. The Awtsmoos allows no history
	 * poll, duplicate façade, raw upstream identity, or prompt-bearing log.
	 */
	async function runTurn({ state, settings }) {
		const turnState = globalObject.AwtsmoosBgTurnState;
		const pending = turnState.beginTurn(state);
		const nextTurn = pending.pendingTurn;
		const prompt = choosePrompt(state, settings, nextTurn);
		if (!prompt) {
			return { stopReason: "done:graph", state };
		}
		let working = { ...state, ...pending };
		working = await saveAndAnnounce(working, state.conversationId);
		stream({ phase: "start", conversationId: state.conversationId, turn: nextTurn, seq: 0 });
		working = await saveAndAnnounce({
			...working,
			...turnState.awaitingAssistant({ pendingTurn: nextTurn })
		}, state.conversationId);
		const result = await globalObject.AwtsmoosBgSendVerifier.sendAndVerify({
			conversationId: state.conversationId,
			conversationKey: working.directConversationKey,
			prompt,
			chatgptMode: state.chatgptMode || settings.chatgptMode || "regular",
			chatgptModePayload: state.chatgptModePayload || settings.chatgptModePayload || {},
			onPacket: event => stream({
				...event,
				conversationId: state.conversationId,
				turn: nextTurn
			})
		});
		if (!result?.ok && !String(result?.text || "").trim()) {
			throw new Error("direct_automation_answer_missing");
		}
		const committed = await saveAndAnnounce({
			...working,
			...turnState.commitTurn(working, result)
		}, state.conversationId);
		return {
			state: committed,
			stopReason: nextTurn >= Number(settings.maxTurns || 0) ? "done:max-turns" : "",
			nextDelayMs: Number(settings.delayMs || 1000)
		};
	}

	function choosePrompt(state, settings, turn) {
		return globalObject.AwtsmoosBgAutomationGraph.chooseAutomationPrompt(
			state.graph,
			{ ...state, settings, turn }
		) || state.prompt || settings.prompt;
	}

	async function saveAndAnnounce(patch, conversationId) {
		const store = globalObject.AwtsmoosBgAutomationStorage;
		const next = await store.saveAutomationState(patch, conversationId);
		globalObject.AwtsmoosBgPageDelegate?.broadcastAutomationState?.(
			store.publicAutomationState(next)
		);
		return next;
	}

	function stream(detail) {
		globalObject.AwtsmoosBgPageDelegate?.broadcastAutomationStream?.(detail);
	}

	globalObject.AwtsmoosBgAutomationTurnRunner = { runTurn };
})(globalThis);

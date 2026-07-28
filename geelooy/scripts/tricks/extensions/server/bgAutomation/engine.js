//B"H
// Boruch Hashem
// Blessed is He

(function installAutomationEngine(globalObject) {
	const busyConversations = new Set();

	/**
	 * The Awtsmoos lets independent Awtsmoos.com runs advance concurrently while
	 * serialized storage and per-conversation guards prevent duplicate submissions.
	 */
	async function tickAutomation(reason = "tick", conversationId = "") {
		const lifecycle = globalObject.AwtsmoosBgAutomationLifecycle;
		const states = conversationId ? [await lifecycle.load(conversationId)] : await dueStates();
		const results = await Promise.all(states.filter(state => state?.conversationId)
			.map(state => tickOne(state, reason)));
		return conversationId ? results[0] : { ok: true, processed: results.length, results };
	}

	async function tickOne(state) {
		const lifecycle = globalObject.AwtsmoosBgAutomationLifecycle;
		const settings = { ...globalObject.AwtsmoosBgAutomationStorage.DEFAULTS, ...(state.settings || {}) };
		if (!state.enabled || busyConversations.has(state.conversationId)) {
			return lifecycle.publicState(state);
		}
		if (Date.now() < Number(state.nextRunAt || 0)) {
			globalObject.AwtsmoosBgAutomationScheduler.schedule(
				state.conversationId,
				state.nextRunAt - Date.now()
			);
			return lifecycle.publicState(state);
		}
		if (Number(state.turns || 0) >= Number(settings.maxTurns || 0)) {
			return lifecycle.stopAutomation("done:max-turns", state.conversationId);
		}
		busyConversations.add(state.conversationId);
		try {
			const outcome = await globalObject.AwtsmoosBgAutomationTurnRunner.runTurn({ state, settings });
			if (outcome.stopReason) {
				return lifecycle.stopAutomation(outcome.stopReason, state.conversationId);
			}
			return scheduleNext(state.conversationId, outcome.nextDelayMs);
		} catch (error) {
			return failAutomation(state.conversationId, error, settings.stopOnError !== false);
		} finally {
			busyConversations.delete(state.conversationId);
		}
	}

	async function scheduleNext(conversationId, delayMs) {
		const patch = globalObject.AwtsmoosBgTurnState.scheduledNext(delayMs);
		const next = await globalObject.AwtsmoosBgAutomationLifecycle.savePublic(patch, conversationId);
		globalObject.AwtsmoosBgAutomationScheduler.schedule(conversationId, delayMs);
		return next;
	}

	async function failAutomation(conversationId, error, stop = true) {
		const lifecycle = globalObject.AwtsmoosBgAutomationLifecycle;
		const next = await lifecycle.savePublic(
			globalObject.AwtsmoosBgTurnState.errorTurn(error),
			conversationId
		);
		if (stop) {
			await lifecycle.stopAutomation("error", conversationId);
		} else {
			await scheduleNext(conversationId, 5000);
		}
		return next;
	}

	async function dueStates() {
		return (await globalObject.AwtsmoosBgAutomationLifecycle.allStates())
			.filter(run => run.enabled && Date.now() >= Number(run.nextRunAt || 0));
	}

	function resourceStatus() {
		return {
			busy: busyConversations.size,
			...globalObject.AwtsmoosBgAutomationScheduler.resourceStatus()
		};
	}

	globalObject.AwtsmoosBgAutomationScheduler.initialize(tickAutomation);
	globalObject.AwtsmoosBgAutomationEngine = {
		startAutomation: globalObject.AwtsmoosBgAutomationLifecycle.startAutomation,
		stopAutomation: globalObject.AwtsmoosBgAutomationLifecycle.stopAutomation,
		statusAutomation: globalObject.AwtsmoosBgAutomationLifecycle.statusAutomation,
		tickAutomation,
		failAutomation,
		resourceStatus
	};
})(globalThis);

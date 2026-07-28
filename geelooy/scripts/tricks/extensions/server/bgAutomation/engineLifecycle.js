//B"H
// Boruch Hashem
// Blessed is He

(function installAutomationLifecycle(globalObject) {
	/**
	 * The Awtsmoos opens, closes, and reports Awtsmoos.com automation runs without
	 * mixing lifecycle bookkeeping into the direct message hot path.
	 */
	async function startAutomation(config = {}) {
		const store = storage();
		const conversationId = String(config.conversationId || "");
		if (!conversationId) {
			throw new Error("conversationId_required");
		}
		const current = await store.loadAutomationState(conversationId);
		const maximum = Number(config.settings?.maxTurns || current.settings?.maxTurns || store.DEFAULTS.maxTurns);
		const next = await store.saveAutomationState({
			...current,
			enabled: true,
			turns: current.enabled && Number(current.turns || 0) < maximum ? Number(current.turns || 0) : 0,
			status: "armed",
			phase: "armed",
			lastError: "",
			nextRunAt: 0,
			pendingTurn: 0,
			graph: config.graph || current.graph || null,
			settings: { ...(config.settings || {}), enabled: true },
			chatgptMode: config.chatgptMode || "regular",
			chatgptModePayload: config.chatgptModePayload || {},
			prompt: config.settings?.prompt || config.prompt || "continue"
		}, conversationId);
		announce(next);
		Promise.resolve().then(() => globalObject.AwtsmoosBgAutomationEngine.tickAutomation("start", conversationId))
			.catch(error => globalObject.AwtsmoosBgAutomationEngine.failAutomation(conversationId, error));
		return publicState(next);
	}

	async function stopAutomation(reason = "stopped", conversationId = "") {
		const targets = conversationId ? [await load(conversationId)] : await allStates();
		for (const state of targets) {
			globalObject.AwtsmoosBgAutomationScheduler.clear(state.conversationId);
			await savePublic({
				enabled: false,
				status: reason,
				phase: reason,
				nextRunAt: 0,
				pendingTurn: 0
			}, state.conversationId);
		}
		return statusAutomation(conversationId);
	}

	async function statusAutomation(conversationId = "") {
		const store = storage();
		if (conversationId) {
			return store.publicAutomationState(await load(conversationId));
		}
		const runs = await allStates();
		const active = runs.filter(run => run.enabled);
		return {
			ok: true,
			enabled: Boolean(active.length),
			status: active.length ? "multi-active" : "off",
			runs: store.publicAutomationList(runs),
			activeCount: active.length
		};
	}

	async function savePublic(patch, conversationId) {
		const next = await storage().saveAutomationState(patch, conversationId);
		announce(next);
		return publicState(next);
	}

	function load(conversationId) {
		return storage().loadAutomationState(conversationId);
	}

	function allStates() {
		return storage().loadAllAutomationStates();
	}

	function publicState(state) {
		return storage().publicAutomationState(state);
	}

	function announce(state) {
		globalObject.AwtsmoosBgPageDelegate?.broadcastAutomationState?.(publicState(state));
	}

	function storage() {
		return globalObject.AwtsmoosBgAutomationStorage;
	}

	globalObject.AwtsmoosBgAutomationLifecycle = {
		startAutomation, stopAutomation, statusAutomation, savePublic, load, allStates, publicState
	};
})(globalThis);

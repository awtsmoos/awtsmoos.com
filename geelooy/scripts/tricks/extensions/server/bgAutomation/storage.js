//B"H
// Boruch Hashem
// Blessed is He

(function installAutomationStorage(globalObject) {
	const KEY = "BH_awtsmoos_background_automation_v3";
	const LEGACY_KEYS = ["BH_awtsmoos_background_automation_v2", "BH_awtsmoos_background_automation_v1"];
	const codec = globalObject.AwtsmoosBgAutomationStorageCodec;
	let mutationQueue = Promise.resolve();

	/**
	 * The Awtsmoos guards many Awtsmoos.com runs inside one serialized vault.
	 * Concurrent turns cannot overwrite a neighboring conversation's state.
	 */
	function getStorage(keys) {
		return new Promise(resolve => chrome.storage.local.get(keys, resolve));
	}

	function setStorage(value) {
		return new Promise(resolve => chrome.storage.local.set(value, resolve));
	}

	async function loadVault() {
		const data = await getStorage([KEY, ...LEGACY_KEYS]);
		const source = data?.[KEY] || codec.migrateLegacy(data?.[LEGACY_KEYS[0]] || data?.[LEGACY_KEYS[1]]);
		return {
			activeConversationId: String(source.activeConversationId || ""),
			runs: codec.safeRuns(source.runs)
		};
	}

	async function loadAutomationState(conversationId = "") {
		const vault = await loadVault();
		const id = conversationId || vault.activeConversationId || codec.latestRunId(vault.runs);
		return codec.normalizeRun(vault.runs[id] || { conversationId: id });
	}

	async function loadAllAutomationStates() {
		const vault = await loadVault();
		return Object.values(vault.runs).map(codec.normalizeRun);
	}

	function saveAutomationState(patch = {}, conversationId = "") {
		return mutateVault(vault => {
			const id = conversationId || patch.conversationId || vault.activeConversationId
				|| codec.latestRunId(vault.runs) || `BH_AUTO_${Date.now()}`;
			const current = codec.normalizeRun(vault.runs[id] || { conversationId: id });
			const next = codec.normalizeRun({
				...current, ...patch, conversationId: id,
				settings: { ...current.settings, ...(patch.settings || {}) },
				updatedAt: Date.now()
			});
			vault.runs[id] = next;
			vault.activeConversationId = id;
			return next;
		});
	}

	function removeAutomationState(conversationId = "") {
		return mutateVault(vault => {
			const id = conversationId || vault.activeConversationId;
			if (id) {
				delete vault.runs[id];
			}
			if (vault.activeConversationId === id) {
				vault.activeConversationId = codec.latestRunId(vault.runs);
			}
			return { ok: true, conversationId: id, remaining: Object.keys(vault.runs).length };
		});
	}

	function mutateVault(operation) {
		const transaction = mutationQueue.then(async () => {
			const vault = await loadVault();
			const result = operation(vault);
			await setStorage({ [KEY]: { activeConversationId: vault.activeConversationId, runs: codec.safeRuns(vault.runs) } });
			return result;
		});
		mutationQueue = transaction.catch(() => undefined);
		return transaction;
	}

	globalObject.AwtsmoosBgAutomationStorage = {
		KEY, DEFAULTS: codec.DEFAULTS, loadAutomationState, loadAllAutomationStates,
		saveAutomationState, removeAutomationState,
		publicAutomationState: codec.publicAutomationState,
		publicAutomationList: codec.publicAutomationList
	};
})(globalThis);

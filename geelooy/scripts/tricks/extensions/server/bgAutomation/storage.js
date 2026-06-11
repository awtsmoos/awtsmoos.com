//B"H
(function(){
  const KEY = "BH_awtsmoos_background_automation_v2";
  const LEGACY_KEY = "BH_awtsmoos_background_automation_v1";
  const DEFAULTS = { enabled:false, maxTurns:3, delayMs:1000, prompt:"continue", stopOnError:true };

  /**
   * B"H
   * Chapter 380: Many Lamps, One Palace, No Flame Devoured Its Brother.
   *
   * Each ChatGPT tab receives its own vessel, keyed by conversationId. The
   * Awtsmoos breathes through all vessels at once: one storage scroll, many
   * living runs, no tab erasing another tab's automation crown.
   *
   * @param {string|string[]} keys Chrome storage keys to read.
   * @returns {Promise<object>} Raw storage result.
   */
  function getStorage(keys) { return new Promise(resolve => chrome.storage.local.get(keys, resolve)); }

  /** @param {object} value Complete storage patch. @returns {Promise<void>} */
  function setStorage(value) { return new Promise(resolve => chrome.storage.local.set(value, resolve)); }

  async function loadVault() {
    const data = await getStorage([KEY, LEGACY_KEY]);
    const vault = data?.[KEY] || migrateLegacy(data?.[LEGACY_KEY]);
    return { activeConversationId:vault.activeConversationId || "", runs:safeRuns(vault.runs) };
  }

  async function saveVault(vault) {
    const clean = { activeConversationId:vault.activeConversationId || "", runs:safeRuns(vault.runs) };
    await setStorage({ [KEY]:clean });
    return clean;
  }

  async function loadAutomationState(conversationId = "") {
    const vault = await loadVault();
    const id = conversationId || vault.activeConversationId || latestRunId(vault.runs);
    return normalizeRun(vault.runs[id] || { conversationId:id });
  }

  async function loadAllAutomationStates() {
    const vault = await loadVault();
    return Object.values(vault.runs).map(normalizeRun);
  }

  async function saveAutomationState(patch = {}, conversationId = "") {
    const vault = await loadVault();
    const id = conversationId || patch.conversationId || vault.activeConversationId || latestRunId(vault.runs) || `BH_AUTO_${Date.now()}`;
    const current = normalizeRun(vault.runs[id] || { conversationId:id });
    const next = normalizeRun({ ...current, ...patch, conversationId:id, settings:{ ...current.settings, ...(patch.settings || {}) }, updatedAt:Date.now() });
    vault.runs[id] = next;
    vault.activeConversationId = id;
    await saveVault(vault);
    return next;
  }

  async function removeAutomationState(conversationId = "") {
    const vault = await loadVault();
    const id = conversationId || vault.activeConversationId;
    if (id) delete vault.runs[id];
    if (vault.activeConversationId === id) vault.activeConversationId = latestRunId(vault.runs);
    await saveVault(vault);
    return { ok:true, conversationId:id, remaining:Object.keys(vault.runs).length };
  }

  function publicAutomationState(state = {}) { const { token, ...safe } = normalizeRun(state); return safe; }
  function publicAutomationList(states = []) { return states.map(publicAutomationState); }
  function safeRuns(runs = {}) { return Object.fromEntries(Object.entries(runs || {}).filter(([, run]) => run && typeof run === "object")); }
  function latestRunId(runs = {}) { return Object.values(runs).sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))[0]?.conversationId || ""; }
  function migrateLegacy(raw = {}) { return raw?.conversationId ? { activeConversationId:raw.conversationId, runs:{ [raw.conversationId]:raw } } : { activeConversationId:"", runs:{} }; }
  function normalizeRun(raw = {}) {
    return { ...DEFAULTS, ...raw, settings:{ ...DEFAULTS, ...(raw.settings || {}) }, turns:Number(raw.turns || 0), pendingTurn:Number(raw.pendingTurn || 0), updatedAt:Number(raw.updatedAt || 0), conversationId:String(raw.conversationId || "") };
  }

  globalThis.AwtsmoosBgAutomationStorage = { KEY, DEFAULTS, loadAutomationState, loadAllAutomationStates, saveAutomationState, removeAutomationState, publicAutomationState, publicAutomationList };
})();

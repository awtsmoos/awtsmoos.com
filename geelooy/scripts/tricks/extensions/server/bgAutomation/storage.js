//B"H
(function(){
  const KEY = "BH_awtsmoos_background_automation_v1";
  const DEFAULTS = { enabled:false, maxTurns:3, delayMs:1000, prompt:"continue", stopOnError:true };

  function getStorage(keys) {
    return new Promise(resolve => chrome.storage.local.get(keys, resolve));
  }

  function setStorage(value) {
    return new Promise(resolve => chrome.storage.local.set(value, resolve));
  }

  async function loadAutomationState() {
    const data = await getStorage(KEY);
    const raw = data?.[KEY] || {};
    return {
      ...DEFAULTS,
      ...raw,
      settings: { ...DEFAULTS, ...(raw.settings || {}) },
      turns: Number(raw.turns || 0),
      updatedAt: Number(raw.updatedAt || 0)
    };
  }

  async function saveAutomationState(patch = {}) {
    const current = await loadAutomationState();
    const next = {
      ...current,
      ...patch,
      settings: { ...current.settings, ...(patch.settings || {}) },
      updatedAt: Date.now()
    };
    await setStorage({ [KEY]: next });
    return next;
  }

  function publicAutomationState(state = {}) {
    const { token, ...safe } = state;
    return safe;
  }

  globalThis.AwtsmoosBgAutomationStorage = {
    KEY, DEFAULTS, loadAutomationState, saveAutomationState, publicAutomationState
  };
})();

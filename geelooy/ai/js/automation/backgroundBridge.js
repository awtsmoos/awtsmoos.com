//B"H

/**
 * Chooses the automation owner.
 *
 * Automation is deliberately background-owned whenever the extension bridge is
 * available. The visible `/ai` page should not run its own continuation loop,
 * because page visibility, repeated text guards, and DOM stream state can stop
 * after the first turn. The background engine waits the configured delay, sends
 * as if the user pressed Enter, and the open page only mirrors state/stream UI.
 */
export async function syncBackgroundAutomation({ settings, graph, conversationId, chatgptMode = "regular", chatgptModePayload = {}, report = () => {} } = {}) {
  const bridge = window.awtsmoosFetch || window.mFetch;
  if (!settings?.enabled) {
    if (isBridgeReady(bridge)) await bridge.stopBackgroundAutomation("page-disabled").catch(error => ({ error: String(error?.message || error) }));
    report("automation off");
    setBridgeFlag(false);
    return { owner: "off", available: Boolean(isBridgeReady(bridge)) };
  }

  if (!isBridgeReady(bridge)) {
    report("automation owner: page fallback · extension bridge missing");
    setBridgeFlag(false);
    return { owner: "page", available: false, reason: "no-extension-bridge" };
  }

  if (!conversationId) {
    report("automation waiting for a conversation id");
    setBridgeFlag(true);
    return { owner: "extension", available: true, waiting: true };
  }

  const cleanSettings = normalizeSettings(settings);
  const state = await bridge.startBackgroundAutomation({ settings: cleanSettings, graph, conversationId, chatgptMode, chatgptModePayload });
  setBridgeFlag(true);
  report(formatBackgroundStatus(state, cleanSettings));
  return { owner: "extension", available: true, state, settings: cleanSettings, backgroundOwned:true };
}

export function hasBackgroundAutomationBridge() {
  const ready = isBridgeReady(window.awtsmoosFetch || window.mFetch);
  setBridgeFlag(ready);
  return ready;
}

export async function getBackgroundAutomationStatus() {
  return await (window.awtsmoosFetch || window.mFetch)?.backgroundAutomationStatus?.();
}

function isBridgeReady(bridge) {
  return Boolean(bridge?.startBackgroundAutomation && bridge?.stopBackgroundAutomation && bridge?.backgroundAutomationStatus);
}

function setBridgeFlag(value) {
  try { globalThis.__awtsmoosBackgroundBridgeActive = Boolean(value); } catch {}
}

function normalizeSettings(settings = {}) {
  return {
    enabled: Boolean(settings.enabled),
    maxTurns: Math.max(1, Number(settings.maxTurns || 3)),
    delayMs: Math.max(0, Number(settings.delayMs || 0)),
    prompt: String(settings.prompt || "continue"),
    stopOnError: settings.stopOnError !== false
  };
}

function formatBackgroundStatus(state = {}, settings = {}) {
  const turn = Number(state.turns || state.committedTurn || 0);
  const pending = Number(state.pendingTurn || 0);
  const max = Number(settings.maxTurns || state.settings?.maxTurns || 0);
  const status = String(state.status || "armed");
  if (/error/i.test(status)) return `automation error · ${state.lastError || "see background"}`;
  if (/scheduled/i.test(status)) return `automation waiting · ${turn}/${max} · next turn armed`;
  if (/sending|awaiting/i.test(status)) return `automation sending · ${pending || turn + 1}/${max}`;
  if (/done:max-turns/i.test(status)) return `automation complete · ${turn}/${max}`;
  return `automation background · ${status} · ${turn}/${max}`;
}

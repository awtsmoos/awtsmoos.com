//B"H

/**
 * Chooses the single automation owner.
 * Extension background is primary; page pipeline is only a fallback.
 */
export async function syncBackgroundAutomation({ settings, graph, conversationId, chatgptMode = "regular", chatgptModePayload = {}, report = () => {} } = {}) {
  const bridge = window.awtsmoosFetch || window.mFetch;
  if (!isBridgeReady(bridge)) {
    report("automation owner: page fallback");
    return { owner: "page", available: false, reason: "no-extension-bridge" };
  }
  if (!settings?.enabled) {
    const stopped = await bridge.stopBackgroundAutomation("page-disabled").catch(error => ({ error: String(error?.message || error) }));
    report("automation owner: off");
    return { owner: "off", available: true, state: stopped };
  }
  if (!conversationId) {
    report("automation owner: waiting for conversation id");
    return { owner: "extension", available: true, waiting: true };
  }
  const cleanSettings = normalizeSettings(settings);
  const state = await bridge.startBackgroundAutomation({ settings: cleanSettings, graph, conversationId, chatgptMode, chatgptModePayload });
  report(`automation owner: extension background · ${state?.status || "armed"} · max ${cleanSettings.maxTurns}`);
  return { owner: "extension", available: true, state, settings: cleanSettings };
}

export function hasBackgroundAutomationBridge() {
  const ready = isBridgeReady(window.awtsmoosFetch || window.mFetch);
  try { globalThis.__awtsmoosBackgroundBridgeActive = ready; } catch {}
  return ready;
}

export async function getBackgroundAutomationStatus() {
  return await (window.awtsmoosFetch || window.mFetch)?.backgroundAutomationStatus?.();
}

function isBridgeReady(bridge) {
  return Boolean(bridge?.startBackgroundAutomation && bridge?.stopBackgroundAutomation && bridge?.backgroundAutomationStatus);
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

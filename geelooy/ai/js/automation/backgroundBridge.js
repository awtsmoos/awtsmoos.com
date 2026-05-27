//B"H

/**
 * Chooses the automation owner.
 *
 * Visible /ai conversations must behave exactly like the human pressing Enter:
 * the page pipeline sends through ConversationController, which reaches
 * AwtsmoosGPTify.go(), the same ChatGPT body/header/sentinel path as textarea
 * send. Extension background remains the owner only when the page is hidden or
 * when a non-visible conversation must keep moving without DOM ownership.
 */
export async function syncBackgroundAutomation({ settings, graph, conversationId, chatgptMode = "regular", chatgptModePayload = {}, report = () => {} } = {}) {
  const bridge = window.awtsmoosFetch || window.mFetch;
  if (!settings?.enabled) {
    if (isBridgeReady(bridge)) await bridge.stopBackgroundAutomation("page-disabled").catch(error => ({ error: String(error?.message || error) }));
    report("automation owner: off");
    return { owner: "off", available: Boolean(isBridgeReady(bridge)) };
  }

  if (shouldUsePageSender(conversationId)) {
    if (isBridgeReady(bridge)) await bridge.stopBackgroundAutomation("visible-page-owns-send").catch(() => null);
    report("automation owner: page · same as textarea send");
    return { owner: "page", available: isBridgeReady(bridge), sameAsTextarea: true };
  }

  if (!isBridgeReady(bridge)) {
    report("automation owner: page fallback");
    return { owner: "page", available: false, reason: "no-extension-bridge" };
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
  const ready = isBridgeReady(window.awtsmoosFetch || window.mFetch) && !shouldUsePageSender(currentConversationId());
  try { globalThis.__awtsmoosBackgroundBridgeActive = ready; } catch {}
  return ready;
}

export async function getBackgroundAutomationStatus() {
  return await (window.awtsmoosFetch || window.mFetch)?.backgroundAutomationStatus?.();
}

function shouldUsePageSender(conversationId) {
  if (!conversationId) return true;
  if (document.visibilityState === "hidden") return false;
  return conversationId === currentConversationId();
}

function currentConversationId() {
  try { return new URLSearchParams(location.search).get("awtsmoosConversation") || window.curConversationId || null; }
  catch { return window.curConversationId || null; }
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

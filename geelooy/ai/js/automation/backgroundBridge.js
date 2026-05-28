//B"H
import { nodeRelayFetch, checkNodeRelay } from "../chatgpt/transport/nodeRelayFetch.js";

/**
 * Chooses the automation owner.
 *
 * Automation is background-owned whenever a background-capable bridge exists:
 * first the Chrome extension, then the localhost Node relay. The visible `/ai`
 * page should not run its own continuation loop unless neither background
 * vessel exists.
 */
export async function syncBackgroundAutomation({ settings, graph, conversationId, chatgptMode = "regular", chatgptModePayload = {}, report = () => {} } = {}) {
  const bridge = await automationBridge();
  if (!settings?.enabled) {
    if (isBridgeReady(bridge)) await bridge.stopBackgroundAutomation("page-disabled", conversationId).catch(error => ({ error: String(error?.message || error) }));
    report("automation off");
    setBridgeFlag(false);
    return { owner: "off", available: Boolean(isBridgeReady(bridge)) };
  }

  if (!isBridgeReady(bridge)) {
    report("automation owner: page fallback · no background bridge");
    setBridgeFlag(false);
    return { owner: "page", available: false, reason: "no-background-bridge" };
  }

  if (!conversationId) {
    report("automation waiting for a conversation id");
    setBridgeFlag(true);
    return { owner: bridge === nodeRelayFetch ? "node-relay" : "extension", available: true, waiting: true };
  }

  const cleanSettings = normalizeSettings(settings);
  const state = await bridge.startBackgroundAutomation({ settings: cleanSettings, graph, conversationId, chatgptMode, chatgptModePayload });
  setBridgeFlag(true);
  report(formatBackgroundStatus(state, cleanSettings));
  return { owner: bridge === nodeRelayFetch ? "node-relay" : "extension", available: true, state, settings: cleanSettings, backgroundOwned:true };
}

export function hasBackgroundAutomationBridge() {
  const ready = isBridgeReady(window.awtsmoosFetch || window.mFetch) || Boolean(globalThis.__awtsmoosBackgroundBridgeActive);
  setBridgeFlag(ready);
  return ready;
}

export async function getBackgroundAutomationStatus() {
  return await (await automationBridge())?.backgroundAutomationStatus?.();
}

async function automationBridge() {
  const extension = window.awtsmoosFetch || window.mFetch;
  if (isBridgeReady(extension)) return extension;
  try { if (await checkNodeRelay()) return nodeRelayFetch; } catch {}
  return extension;
}

function isBridgeReady(bridge) {
  return Boolean(bridge?.startBackgroundAutomation && bridge?.stopBackgroundAutomation && bridge?.backgroundAutomationStatus);
}

function setBridgeFlag(value) { try { globalThis.__awtsmoosBackgroundBridgeActive = Boolean(value); } catch {} }

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
  const owner = state.owner === "node-relay" ? "relay" : "background";
  if (/error/i.test(status)) return `automation error · ${state.lastError || "see background"}`;
  if (/scheduled/i.test(status)) return `automation waiting · ${turn}/${max} · next turn armed`;
  if (/sending|awaiting/i.test(status)) return `automation ${owner} sending · ${pending || turn + 1}/${max}`;
  if (/done:max-turns/i.test(status)) return `automation complete · ${turn}/${max}`;
  return `automation ${owner} · ${status} · ${turn}/${max}`;
}

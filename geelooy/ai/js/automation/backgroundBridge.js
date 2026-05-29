//B"H
import { nodeRelayFetch, checkNodeRelay } from "../chatgpt/transport/nodeRelayFetch.js";

const EXPLICIT_BACKGROUND_KEY = "awtsmoos.backgroundAutomation.enabled";

/**
 * B"H
 * Chapter 142: The Background Was Bound, Not Crowned.
 *
 * Normal automation belongs to the visible page, because the visible page sends
 * through the same controller as a human. The background may only take the wheel
 * after explicit opt-in, and when it does, delay min/max travel with the rest of
 * the settings so no old fixed-delay ghost survives.
 */
export async function syncBackgroundAutomation({ settings, graph, conversationId, chatgptMode = "regular", chatgptModePayload = {}, report = () => {} } = {}) {
  const bridge = await automationBridge();
  if (!settings?.enabled) return await stopBackground({ bridge, conversationId, report });
  if (!shouldUseBackground(settings)) {
    if (isBridgeReady(bridge)) await bridge.stopBackgroundAutomation("visible-page-owner", conversationId).catch(error => ({ error: String(error?.message || error) }));
    report("automation owner: visible page sender · same route as Send");
    setBridgeFlag(false);
    return { owner: "page", available: Boolean(isBridgeReady(bridge)), reason: "visible-page-sends-like-user" };
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
  return { owner: bridge === nodeRelayFetch ? "node-relay" : "extension", available: true, state, settings: cleanSettings, backgroundOwned: true };
}

export function hasBackgroundAutomationBridge() {
  return Boolean(globalThis.__awtsmoosBackgroundBridgeActive);
}

export async function getBackgroundAutomationStatus() {
  return await (await automationBridge())?.backgroundAutomationStatus?.();
}

async function stopBackground({ bridge, conversationId, report }) {
  if (isBridgeReady(bridge)) await bridge.stopBackgroundAutomation("page-disabled", conversationId).catch(error => ({ error: String(error?.message || error) }));
  report("automation off");
  setBridgeFlag(false);
  return { owner: "off", available: Boolean(isBridgeReady(bridge)) };
}

async function automationBridge() {
  const extension = window.awtsmoosFetch || window.mFetch;
  if (isBridgeReady(extension)) return extension;
  try { if (await checkNodeRelay()) return nodeRelayFetch; } catch {}
  return extension;
}

function shouldUseBackground(settings = {}) {
  if (settings.backgroundOwned === true || settings.background === true) return true;
  try { return localStorage.getItem(EXPLICIT_BACKGROUND_KEY) === "1"; } catch { return false; }
}

function isBridgeReady(bridge) {
  return Boolean(bridge?.startBackgroundAutomation && bridge?.stopBackgroundAutomation && bridge?.backgroundAutomationStatus);
}

function setBridgeFlag(value) { try { globalThis.__awtsmoosBackgroundBridgeActive = Boolean(value); } catch {} }

function normalizeSettings(settings = {}) {
  const delayMinMs = Math.max(0, Number(settings.delayMinMs ?? settings.delayMs ?? 0));
  const delayMaxMs = Math.max(delayMinMs, Number(settings.delayMaxMs ?? settings.delayMs ?? delayMinMs));
  return {
    enabled: Boolean(settings.enabled),
    maxTurns: Math.max(1, Number(settings.maxTurns || 3)),
    delayMs: delayMinMs,
    delayMinMs,
    delayMaxMs,
    streamSettleMs: Math.max(0, Number(settings.streamSettleMs || 0)),
    prompt: String(settings.prompt || "continue"),
    promptMode: settings.promptMode || "single",
    promptListText: String(settings.promptListText || ""),
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

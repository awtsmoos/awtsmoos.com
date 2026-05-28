//B"H
import { StreamRouter } from "../app/streamRouter.js";

const MIRROR_IDLE_NOTICE_MS = 45000;
const MIRROR_HARD_SILENCE_MS = 20 * 60 * 1000;

/**
 * Chapter 107: The Mirror Refused To Erase The Footprints.
 *
 * When background support speaks, the visible page mirrors it. But an error or
 * stop event must never reload the conversation and wipe the user prompt that
 * just appeared. The Awtsmoos leaves the footprint visible: prompt, stream,
 * error, and status, each in its own vessel, until a real committed turn asks
 * for history refresh.
 */
export function mountBackgroundAutomationMirror({ renderer, controller, panel, getConversationId }) {
  const streams = new Map();
  window.addEventListener("awtsmoos-background-automation-state", event => mirrorState(event.detail || {}));
  window.addEventListener("awtsmoos-background-automation-stream", event => mirrorStream(event.detail || {}));

  async function mirrorState(state) {
    panel.report(`automation owner: extension background · ${state.status || "state"} · ${state.turns || 0}/${state.settings?.maxTurns || "?"}`);
    if (state.conversationId !== getConversationId()) return;
    if (isFailureState(state)) await showFailureState(state);
    if (shouldRefreshConversation(state)) await controller.loadConversation?.(state.conversationId, { preserveVisibleStream:true, source:"background-automation-state" });
    if (isTerminalState(state)) await finishMirrorsForConversation(state.conversationId, state.status || "stopped");
  }

  async function mirrorStream(detail) {
    if (!detail?.conversationId || detail.conversationId !== getConversationId()) return;
    const key = streamKey(detail);
    const entry = streams.get(key) || startMirror(key, detail);
    if (!entry) return;
    if (detail.phase === "start") return;
    entry.pending.set(Number(detail.seq || 0), detail);
    await drainMirrorQueue(key, entry);
  }

  function startMirror(key, detail = {}) {
    if (streams.has(key)) return streams.get(key);
    const prompt = String(detail.prompt || "").trim();
    if (prompt) renderer.add({ message: { author: { role: "user" }, content: { parts: [prompt] } } });
    const entry = { seq: 0, pending: new Map(), router: new StreamRouter(renderer), idleTimer: null, startedAt: Date.now(), lastPacketAt: Date.now(), conversationId: detail.conversationId };
    entry.router.open();
    streams.set(key, entry);
    armIdleNotice(key, entry, detail);
    renderer.forceScrollDownSoon?.();
    panel.report(`automation streaming turn ${detail.turn || ""}`);
    return entry;
  }

  async function drainMirrorQueue(key, entry) {
    while (entry.pending.has(entry.seq + 1)) {
      const detail = entry.pending.get(entry.seq + 1);
      entry.pending.delete(entry.seq + 1);
      entry.seq++;
      entry.lastPacketAt = Date.now();
      armIdleNotice(key, entry, detail);
      if (detail.phase === "packet") await entry.router.route(detail.packet || detail);
      if (detail.phase === "done") return await finishMirror(key, entry, detail);
    }
  }

  function armIdleNotice(key, entry, detail = {}) {
    clearTimeout(entry.idleTimer);
    entry.idleTimer = setTimeout(async () => {
      if (!streams.has(key)) return;
      const silentFor = Date.now() - entry.lastPacketAt;
      await entry.router.route(waitingPacket(silentFor));
      panel.report(`automation stream still waiting · ${Math.round(silentFor / 1000)}s`);
      if (Date.now() - entry.startedAt < MIRROR_HARD_SILENCE_MS) armIdleNotice(key, entry, detail);
    }, MIRROR_IDLE_NOTICE_MS);
  }

  async function finishMirror(key, entry, detail = {}) {
    clearTimeout(entry.idleTimer);
    await entry.router.finish(detail.packet || { dataNoJSON: "[DONE]" });
    streams.delete(key);
    renderer.forceScrollDownSoon?.();
    panel.report(`automation mirrored turn complete ${detail.turn || ""}`);
  }

  async function finishMirrorsForConversation(conversationId, reason = "stopped") {
    for (const [key, entry] of [...streams]) {
      if (entry.conversationId !== conversationId) continue;
      await entry.router.route({ awtsmoos: { otherEvents: [{ type: "automation_stream_closed", text: `Automation stream closed: ${reason}` }] } });
      await finishMirror(key, entry, { conversationId, packet: { dataNoJSON: "[DONE]" } });
    }
  }

  async function showFailureState(state = {}) {
    const message = state.lastError || state.error || state.safeHint || state.status || "Automation stopped before ChatGPT accepted the next turn.";
    renderer.add({ message: { author: { role: "assistant" }, content: { parts: [`Automation did not send the next message.\n\n${message}`] } } });
    renderer.forceScrollDownSoon?.();
  }

  function shouldRefreshConversation(state = {}) {
    const status = String(state.status || "");
    return /committed|done:max-turns/i.test(status) && !streams.has(streamKey({ conversationId:state.conversationId, turn:state.turns }));
  }

  function isTerminalState(state = {}) { return /stopped|max-turns/i.test(String(state.status || "")); }
  function isFailureState(state = {}) { return /error|token_absent|missing_token|rate_limited/i.test(String(`${state.status || ""} ${state.lastError || ""} ${state.error || ""}`)); }
  function streamKey(detail = {}) { return `${detail.conversationId}:${detail.turn || 0}`; }
}

function waitingPacket(silentFor = 0) {
  return { type: "automation_stream_waiting", text: "", dataNoJSON: "", awtsmoos: { otherEvents: [{ type: "automation_stream_waiting", text: `Still waiting for ChatGPT stream after ${Math.round(silentFor / 1000)}s…` }] } };
}

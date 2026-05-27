//B"H
import { StreamRouter } from "../app/streamRouter.js";

const MIRROR_IDLE_NOTICE_MS = 45000;
const MIRROR_HARD_SILENCE_MS = 20 * 60 * 1000;

/**
 * Chapter 98: The Mirror Learned Patience.
 *
 * A long ChatGPT turn may pause while tools run, files upload, or the model
 * thinks. The old mirror treated 45 seconds of silence as completion, producing
 * exactly the dead empty assistant seen in the pasted end fragment. This mirror
 * never finalizes from silence. It emits a tiny status event, keeps the live
 * vessel open, and waits for a real `phase:"done"` from the extension stream.
 */
export function mountBackgroundAutomationMirror({ renderer, controller, panel, getConversationId }) {
  const streams = new Map();
  window.addEventListener("awtsmoos-background-automation-state", event => mirrorState(event.detail || {}));
  window.addEventListener("awtsmoos-background-automation-stream", event => mirrorStream(event.detail || {}));

  async function mirrorState(state) {
    panel.report(`automation owner: extension background · ${state.status || "state"} · ${state.turns || 0}/${state.settings?.maxTurns || "?"}`);
    if (state.conversationId !== getConversationId()) return;
    if (/error|stopped|max-turns/i.test(String(state.status || ""))) await finishMirrorsForConversation(state.conversationId, state.status || "stopped");
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
    const entry = {
      seq: 0,
      pending: new Map(),
      router: new StreamRouter(renderer),
      idleTimer: null,
      startedAt: Date.now(),
      lastPacketAt: Date.now(),
      conversationId: detail.conversationId
    };
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
      if (detail.phase === "packet") await entry.router.route(detail.packet);
      if (detail.phase === "done") return await finishMirror(key, entry, detail);
    }
  }

  function armIdleNotice(key, entry, detail = {}) {
    clearTimeout(entry.idleTimer);
    entry.idleTimer = setTimeout(async () => {
      if (!streams.has(key)) return;
      const silentFor = Date.now() - entry.lastPacketAt;
      await entry.router.route({
        type: "automation_stream_waiting",
        text: "",
        dataNoJSON: "",
        awtsmoos: { otherEvents: [{ type: "automation_stream_waiting", text: `Still waiting for ChatGPT stream after ${Math.round(silentFor / 1000)}s…` }] }
      });
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

  function streamKey(detail = {}) {
    return `${detail.conversationId}:${detail.turn || 0}`;
  }
}

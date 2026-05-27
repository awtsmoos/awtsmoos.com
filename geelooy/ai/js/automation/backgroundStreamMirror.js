//B"H
import { StreamRouter } from "../app/streamRouter.js";

/** Mirrors extension-owned automation streams into an open /ai page. */
export function mountBackgroundAutomationMirror({ renderer, controller, panel, getConversationId }) {
  const streams = new Map();
  window.addEventListener("awtsmoos-background-automation-state", event => mirrorState(event.detail || {}));
  window.addEventListener("awtsmoos-background-automation-stream", event => mirrorStream(event.detail || {}));

  async function mirrorState(state) {
    panel.report(`automation owner: extension background · ${state.status || "state"} · ${state.turns || 0}/${state.settings?.maxTurns || "?"}`);
    if (state.conversationId === getConversationId() && /done|max-turns|error/.test(String(state.status || ""))) await controller.loadConversation(state.conversationId);
  }

  async function mirrorStream(detail) {
    if (!detail?.conversationId || detail.conversationId !== getConversationId()) return;
    const key = `${detail.conversationId}:${detail.turn || 0}`;
    if (detail.phase === "start") return startMirror(key, detail);
    const entry = streams.get(key);
    if (!entry) return;
    entry.pending.set(Number(detail.seq || 0), detail);
    await drainMirrorQueue(key, entry);
  }

  function startMirror(key, detail) {
    if (streams.has(key)) return;
    renderer.add({ message: { author: { role: "user" }, content: { parts: [String(detail.prompt || "")] } } });
    streams.set(key, { seq: 0, pending: new Map(), router: new StreamRouter(renderer) });
    panel.report(`automation streaming turn ${detail.turn || ""}`);
  }

  async function drainMirrorQueue(key, entry) {
    while (entry.pending.has(entry.seq + 1)) {
      const detail = entry.pending.get(entry.seq + 1);
      entry.pending.delete(entry.seq + 1);
      entry.seq++;
      if (detail.phase === "packet") await entry.router.route(detail.packet);
      if (detail.phase === "done") return await finishMirror(key, entry, detail);
    }
  }

  async function finishMirror(key, entry, detail) {
    await entry.router.finish(detail.packet || { dataNoJSON: "[DONE]" });
    streams.delete(key);
    panel.report(`automation mirrored turn complete ${detail.turn || ""}`);
    await controller.loadConversation(detail.conversationId);
  }
}

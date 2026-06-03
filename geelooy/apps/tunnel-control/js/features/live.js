// B"H
import { h, out, $ } from "../ui/dom.js";
import { callFs } from "../api/tunnel.js";
import { readLocalSetting, saveLocalSetting } from "../state/storage.js";

const LIVE_KEY = "awtLiveTrafficHistory";
const STREAMS = ["all", "agents", "tasks", "actions", "sockets", "errors", "system"];
let timer = null;
let channel = null;
let history = [];

/**
 * B"H
 * Chapter 370: Yesod Opened The Living Wires.
 *
 * This pane is the socket-vessel: BroadcastChannel for local realtime tabs,
 * polling for the tunnel action rivers, persistent history for page sleep, and
 * categorized streams so every agent saying, doing, spawning, failing, or
 * finishing can be watched after the user returns to the page.
 */
export function live() {
  return h("section", { className: "pane awt-live-console", data: { pane: "live" } }, [
    h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "LIVE" }), h("h2", { text: "Realtime agent traffic" }), h("p", { text: "Monitor agent speech, task state, action history, socket pulses, and persisted traffic streams." })]),
    h("article", { className: "panel stack awt-live-control" }, [
      h("div", { className: "form-grid" }, [streamSelect(), limitInput(), h("label", {}, ["Poll ms", h("input", { id: "livePollMs", type: "number", min: "1000", value: "2500" })])]),
      h("div", { className: "button-row" }, [button("startLiveBtn", "Start LIVE", "primary"), button("stopLiveBtn", "Stop"), button("refreshLiveBtn", "Refresh now"), button("clearLiveBtn", "Clear local history")]),
      h("div", { id: "liveSocketState", className: "notice", text: "Socket idle. History restores from local storage after refresh." })
    ]),
    h("article", { className: "panel stack" }, [h("div", { className: "awt-live-board", id: "liveBoard" })]),
    h("article", { className: "panel stack" }, [h("h3", { text: "Raw stream frame" }), out("liveOut", "No live frame yet.")])
  ]);
}
export function mountLive(getTunnelName) {
  if (!$("startLiveBtn")) return;
  $("startLiveBtn").onclick = () => start(getTunnelName);
  $("stopLiveBtn").onclick = stop;
  $("refreshLiveBtn").onclick = () => sample(getTunnelName, "manual");
  $("clearLiveBtn").onclick = clearHistory;
  $("liveStreamFilter").onchange = render;
  $("liveLimit").onchange = render;
  window.addEventListener("focus", () => sample(getTunnelName, "focus"));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) sample(getTunnelName, "visible"); });
  restore().then(() => { render(); start(getTunnelName); });
}
function streamSelect() { return h("label", {}, ["Stream", h("select", { id: "liveStreamFilter" }, STREAMS.map(value => h("option", { value, text: value }))) ]); }
function limitInput() { return h("label", {}, ["History limit", h("input", { id: "liveLimit", type: "number", min: "20", value: "80" })]); }
function button(id, text, className = "") { return h("button", { id, text, className }); }
function start(getTunnelName) {
  stop();
  channel = "BroadcastChannel" in window ? new BroadcastChannel("awtsmoos:live-agent-traffic") : null;
  if (channel) channel.onmessage = event => addEvent({ stream: "sockets", title: "Peer tab frame", detail: event.data, source: "BroadcastChannel" });
  setState("LIVE socket bridge running. Polling continues after pane changes; focus/visibility refreshes history.");
  sample(getTunnelName, "start");
  timer = setInterval(() => sample(getTunnelName, "interval"), Number($("livePollMs")?.value || 2500));
}
function stop() { if (timer) clearInterval(timer); timer = null; if (channel) channel.close(); channel = null; setState("LIVE socket bridge stopped. Local history remains."); }
async function sample(getTunnelName, reason = "sample") {
  const tunnelName = getTunnelName?.() || window.awtsGetTunnelName?.() || "";
  addEvent({ stream: "sockets", title: `Live sample: ${reason}`, detail: { tunnelName }, source: "local" });
  const frames = await Promise.allSettled([agentFrame(tunnelName), taskFrame(tunnelName), actionFrame(tunnelName)]);
  frames.forEach(frame => frame.status === "fulfilled" ? frame.value.forEach(addEvent) : addEvent({ stream: "errors", title: "Live sample failed", detail: String(frame.reason), source: "live" }));
  channel?.postMessage({ at: Date.now(), reason, count: history.length });
  await persist(); render();
}
async function agentFrame(tunnelName) {
  const got = await callFs(tunnelName, { action: "aiAgentList" });
  return [event("agents", "Agent council", got, `${(got.agents || []).filter(a => a.ready).length}/${(got.agents || []).length} ready`)];
}
async function taskFrame(tunnelName) {
  const got = await callFs(tunnelName, { action: "aiAgentTaskList", limit: 50 });
  const tasks = got.tasks || [];
  return [event("tasks", "Task list", got, `${tasks.filter(t => t.status === "running").length} running · ${tasks.length} total`), ...tasks.slice(0, 8).map(task => event("tasks", `${task.status}: ${task.input?.title || task.id}`, task, task.id))];
}
async function actionFrame(tunnelName) {
  const got = await callFs(tunnelName, { action: "actionHistoryList", limit: 40 });
  if (got.ok === false) return [event("actions", "Action history unavailable", got, got.error || "not available")];
  const actions = got.items || got.history || got.actions || [];
  return [event("actions", "Action history", got, `${actions.length} actions`), ...actions.slice(0, 8).map(item => event("actions", item.action || item.name || item.id || "action", item, item.status || item.id || "record"))];
}
function event(stream, title, detail, sub = "") { return { stream, title, sub, detail, source: "tunnel", at: Date.now(), id: `${stream}_${Date.now()}_${Math.random().toString(36).slice(2)}` }; }
function addEvent(entry) { history.unshift({ id: entry.id || `live_${Date.now()}_${Math.random().toString(36).slice(2)}`, at: entry.at || Date.now(), stream: entry.stream || "system", title: entry.title || "Live event", sub: entry.sub || "", source: entry.source || "ui", detail: entry.detail || {} }); history.splice(300); }
async function restore() { history = await readLocalSetting(LIVE_KEY, []); }
async function persist() { await saveLocalSetting(LIVE_KEY, history); }
async function clearHistory() { history = []; await persist(); render(); setState("Local live traffic history cleared."); }
function render() {
  const board = $("liveBoard"); if (!board) return;
  const stream = $("liveStreamFilter")?.value || "all";
  const limit = Number($("liveLimit")?.value || 80);
  const shown = history.filter(item => stream === "all" || item.stream === stream).slice(0, limit);
  board.replaceChildren(...shown.map(card));
  $("liveOut").textContent = JSON.stringify({ total: history.length, stream, shown: shown.length, latest: shown[0] || null }, null, 2);
}
function card(item) { return h("div", { className: `awt-live-event awt-live-${item.stream}`, data: { stream: item.stream }, children: [h("span", { className: "awt-live-kind", text: item.stream }), h("strong", { text: item.title }), h("small", { text: `${new Date(item.at).toLocaleTimeString()} · ${item.source}${item.sub ? " · " + item.sub : ""}` })] }); }
function setState(text) { if ($("liveSocketState")) $("liveSocketState").textContent = text; }

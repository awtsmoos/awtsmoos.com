// B"H
import { h, out, $ } from "../ui/dom.js";
import { getJson } from "../api/http.js";
import { readLocalSetting, saveLocalSetting } from "../state/storage.js";

const SETTINGS_KEY = "awtLiveCallsSettings";
const ROW_HEIGHT = 76;
const DEFAULT_SETTINGS = { groupBy: "conversation", filter: "", limit: 300, pollMs: 2500 };

let timer = null;
let state = {
  settings: { ...DEFAULT_SETTINGS },
  events: [],
  groups: [],
  selectedGroup: "",
  selectedEvent: null,
  scrollTop: 0,
  running: false,
  lastError: ""
};

export function live() {
  return h("section", { className: "pane awt-live-console", data: { pane: "live" } }, [
    h("div", { className: "page-head" }, [
      h("p", { className: "eyebrow", text: "LIVE" }),
      h("h2", { text: "Tunnel calls" }),
      h("p", { text: "Monitor grouped tunnel calls from all recorded chats. The list is virtualized so it can stay open during long agent runs." })
    ]),
    h("article", { className: "panel stack awt-live-control" }, [
      h("div", { className: "form-grid" }, [
        label("Group", h("select", { id: "liveGroupBy" }, ["conversation", "tunnel", "action", "vessel", "ok"].map(value => h("option", { value, text: value })))),
        label("Filter", h("input", { id: "liveFilter", placeholder: "action, chat, tunnel, path..." })),
        label("Limit", h("input", { id: "liveLimit", type: "number", min: "20", max: "1000", value: "300" })),
        label("Poll ms", h("input", { id: "livePollMs", type: "number", min: "1000", value: "2500" }))
      ]),
      h("div", { className: "button-row" }, [
        button("startLiveBtn", "Start", "primary"),
        button("stopLiveBtn", "Stop"),
        button("refreshLiveBtn", "Refresh"),
        button("clearLiveBtn", "Reset view")
      ]),
      h("div", { id: "liveSocketState", className: "notice", text: "Live calls idle." })
    ]),
    h("article", { className: "awt-live-layout" }, [
      h("aside", { id: "liveGroups", className: "panel awt-live-sidebar" }),
      h("section", { className: "panel awt-live-stage" }, [
        h("div", { className: "awt-live-meta", id: "liveSummary", text: "No events loaded." }),
        h("div", { className: "awt-live-viewport", id: "liveViewport" }, [
          h("div", { className: "awt-live-spacer", id: "liveSpacer" }, [
            h("div", { className: "awt-live-window", id: "liveWindow" })
          ])
        ])
      ])
    ]),
    h("article", { className: "panel stack" }, [h("h3", { text: "Selected frame" }), out("liveOut", "No live frame selected.")])
  ]);
}

export function mountLive() {
  if (!$("startLiveBtn")) return;
  $("startLiveBtn").onclick = start;
  $("stopLiveBtn").onclick = stop;
  $("refreshLiveBtn").onclick = () => refresh("manual");
  $("clearLiveBtn").onclick = resetView;
  $("liveGroupBy").onchange = updateSettings;
  $("liveFilter").oninput = debounce(updateSettings, 250);
  $("liveLimit").onchange = updateSettings;
  $("livePollMs").onchange = updateSettings;
  $("liveViewport").addEventListener("scroll", () => {
    state.scrollTop = $("liveViewport").scrollTop;
    renderRows();
  });
  restore().then(() => {
    hydrateInputs();
    start();
  });
}

function label(text, child) { return h("label", {}, [text, child]); }
function button(id, text, className = "") { return h("button", { id, text, className }); }

async function restore() {
  const saved = await readLocalSetting(SETTINGS_KEY, DEFAULT_SETTINGS);
  state.settings = { ...DEFAULT_SETTINGS, ...(saved || {}) };
}

async function persist() {
  await saveLocalSetting(SETTINGS_KEY, state.settings);
}

function hydrateInputs() {
  if ($("liveGroupBy")) $("liveGroupBy").value = state.settings.groupBy;
  if ($("liveFilter")) $("liveFilter").value = state.settings.filter;
  if ($("liveLimit")) $("liveLimit").value = String(state.settings.limit);
  if ($("livePollMs")) $("livePollMs").value = String(state.settings.pollMs);
}

async function updateSettings() {
  state.settings = {
    groupBy: $("liveGroupBy")?.value || "conversation",
    filter: $("liveFilter")?.value || "",
    limit: clamp(Number($("liveLimit")?.value || 300), 20, 1000),
    pollMs: clamp(Number($("livePollMs")?.value || 2500), 1000, 60000)
  };
  await persist();
  if (state.running) start();
  else await refresh("settings");
}

function start() {
  stop();
  state.running = true;
  setStatus("Live calls running.");
  refresh("start");
  timer = setInterval(() => refresh("interval"), state.settings.pollMs);
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
  state.running = false;
  setStatus("Live calls stopped.");
}

async function resetView() {
  state.events = [];
  state.groups = [];
  state.selectedGroup = "";
  state.selectedEvent = null;
  state.scrollTop = 0;
  state.lastError = "";
  render();
  setStatus("Live view reset.");
}

async function refresh(reason = "refresh") {
  try {
    const url = new URL("/api/tunnel/control/live-calls", location.origin);
    url.searchParams.set("groupBy", state.settings.groupBy);
    url.searchParams.set("limit", String(state.settings.limit));
    if (state.settings.filter) url.searchParams.set("filter", state.settings.filter);
    const got = await getJson(url.toString(), { credentials: "include" });
    if (got.ok === false) throw new Error(got.error || "live_calls_failed");
    state.events = got.events || [];
    state.groups = got.groups || [];
    if (!state.selectedGroup && state.groups[0]) state.selectedGroup = state.groups[0].key;
    state.lastError = "";
    setStatus(`Live calls updated: ${got.total || 0} total, ${state.events.length} loaded (${reason}).`);
  } catch (error) {
    state.lastError = error.message || String(error);
    setStatus(`Live calls error: ${state.lastError}`);
  }
  render();
}

function render() {
  renderGroups();
  renderRows();
  renderSummary();
  renderSelected();
}

function renderGroups() {
  const root = $("liveGroups");
  if (!root) return;
  const groups = state.groups.length ? state.groups : [{ key: "all", title: "All calls", count: state.events.length, ok: 0, failed: 0, lastAt: Date.now() }];
  root.replaceChildren(...groups.map(group => h("button", {
    className: `awt-live-group ${state.selectedGroup === group.key ? "is-active" : ""}`,
    on: { click: () => { state.selectedGroup = group.key; state.scrollTop = 0; $("liveViewport").scrollTop = 0; render(); } }
  }, [
    h("strong", { text: group.title || group.key }),
    h("small", { text: `${group.count} calls · ${group.failed || 0} failed · ${time(group.lastAt)}` })
  ])));
}

function selectedEvents() {
  if (!state.selectedGroup) return state.events;
  const groupBy = state.settings.groupBy;
  return state.events.filter(event => (event.groupKeys?.[groupBy] || event.conversationId || "unknown") === state.selectedGroup);
}

function renderRows() {
  const viewport = $("liveViewport");
  const spacer = $("liveSpacer");
  const win = $("liveWindow");
  if (!viewport || !spacer || !win) return;
  const events = selectedEvents();
  spacer.style.height = `${Math.max(events.length * ROW_HEIGHT, viewport.clientHeight || ROW_HEIGHT)}px`;
  const start = Math.max(0, Math.floor(viewport.scrollTop / ROW_HEIGHT) - 4);
  const visible = Math.ceil((viewport.clientHeight || 480) / ROW_HEIGHT) + 8;
  const slice = events.slice(start, start + visible);
  win.style.transform = `translateY(${start * ROW_HEIGHT}px)`;
  win.replaceChildren(...slice.map(row));
}

function row(event) {
  return h("button", {
    className: "awt-live-row",
    data: { ok: event.ok !== false },
    on: { click: () => { state.selectedEvent = event; renderSelected(); } }
  }, [
    h("span", { className: "awt-live-kind", text: event.kind || "action" }),
    h("span", {}, [
      h("strong", { text: event.title || event.action || event.id }),
      h("span", { className: "awt-live-meta" }, [
        h("span", { text: event.conversationName || event.conversationId || "conversation" }),
        h("span", { text: event.tunnelName || "tunnel" }),
        h("span", { text: event.targetVessel || "vessel" }),
        h("span", { text: event.path || "" })
      ])
    ]),
    h("span", { className: event.ok === false ? "awt-live-status-fail" : "awt-live-status-ok", text: `${event.ok === false ? "failed" : "ok"} · ${time(event.at)}` })
  ]);
}

function renderSummary() {
  const events = selectedEvents();
  const text = `${events.length} visible calls · ${state.events.length} loaded · grouped by ${state.settings.groupBy}${state.lastError ? " · " + state.lastError : ""}`;
  if ($("liveSummary")) $("liveSummary").textContent = text;
}

function renderSelected() {
  const selected = state.selectedEvent || selectedEvents()[0] || null;
  if ($("liveOut")) $("liveOut").textContent = JSON.stringify(selected || { ok: true, message: "No live frame selected." }, null, 2);
}

function setStatus(text) {
  if ($("liveSocketState")) $("liveSocketState").textContent = text;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(Number.isFinite(value) ? value : min, max));
}

function time(value) {
  const n = Number(value || 0);
  return n ? new Date(n).toLocaleTimeString() : "unknown";
}

function debounce(fn, ms) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

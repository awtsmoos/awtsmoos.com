// B"H
import { h, out, $ } from "../ui/dom.js";
import { getJson } from "../api/http.js";
import { readLocalSetting, saveLocalSetting } from "../state/storage.js";

const KEY = "awtLiveActions.v2";
const DEFAULTS = { groupBy: "conversation", filter: "", limit: 300, pollMs: 2500 };
let poll = 0, socket = null, source = null;
let state = { settings: { ...DEFAULTS }, events: [], groups: [], selectedGroup: "", selected: null, mode: "idle", error: "", updatedAt: 0 };

/**
 * B"H
 * Chapter 914: The cockpit now climbs three ladders: socket, stream, poll.
 */
export function live() {
  return h("section", { className: "pane awt-live-console", data: { pane: "live" } }, [head(), controls(), kpis(), h("article", { className: "awt-live-shell" }, [h("aside", { id: "liveGroups", className: "panel awt-live-groups" }), h("section", { className: "panel awt-live-feed" }, [h("div", { id: "liveSummary", className: "awt-live-summary", text: "No frames yet." }), h("div", { id: "liveWindow", className: "awt-live-window" })]), h("aside", { className: "panel awt-live-inspector" }, [h("h3", { text: "Frame inspector" }), out("liveOut", "Select a frame.")])])]);
}

export function mountLive() { if (!$("startLiveBtn")) return; bind(); restore().then(() => { hydrate(); connect(); }); }
function head() { return h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "LIVE ACTIONS" }), h("h2", { text: "Live actions cockpit" }), h("p", { text: "WebSocket-first action stream with EventSource server-push fallback, grouped channels, cards, and raw inspection." })]); }
function controls() { return h("article", { className: "panel stack awt-live-control" }, [h("div", { className: "form-grid" }, [label("Group", h("select", { id: "liveGroupBy" }, ["conversation", "tunnel", "action", "vessel", "ok"].map(x => h("option", { value: x, text: x })))), label("Search", h("input", { id: "liveFilter", placeholder: "action, path, tunnel, chat..." })), label("Limit", h("input", { id: "liveLimit", type: "number", min: "20", max: "1000", value: "300" })), label("Fallback poll", h("input", { id: "livePollMs", type: "number", min: "1000", value: "2500" }))]), h("div", { className: "button-row" }, [button("startLiveBtn", "Connect", "primary"), button("stopLiveBtn", "Pause"), button("refreshLiveBtn", "Snapshot"), button("clearLiveBtn", "Clear")]), h("div", { id: "liveSocketState", className: "notice", text: "Idle." })]); }
function kpis() { return h("article", { className: "awt-live-kpis" }, ["mode", "total", "ok", "failed", "visible", "updated"].map(id => h("div", { className: "panel awt-live-kpi" }, [h("span", { text: id }), h("strong", { id: `liveKpi_${id}`, text: "—" })]))); }
function label(text, child) { return h("label", {}, [text, child]); }
function button(id, text, className = "") { return h("button", { id, text, className }); }

function bind() { $("startLiveBtn").onclick = connect; $("stopLiveBtn").onclick = pause; $("refreshLiveBtn").onclick = () => snapshot("manual"); $("clearLiveBtn").onclick = clear; for (const id of ["liveGroupBy", "liveLimit", "livePollMs"]) $(id).onchange = settingsChanged; $("liveFilter").oninput = debounce(settingsChanged, 250); }
async function restore() { state.settings = { ...DEFAULTS, ...(await readLocalSetting(KEY, DEFAULTS) || {}) }; }
function hydrate() { for (const [k, v] of Object.entries(state.settings)) if ($(`live${cap(k)}`)) $(`live${cap(k)}`).value = String(v); }
async function settingsChanged() { state.settings = { groupBy: $("liveGroupBy").value, filter: $("liveFilter").value, limit: clamp($("liveLimit").value, 20, 1000), pollMs: clamp($("livePollMs").value, 1000, 60000) }; await saveLocalSetting(KEY, state.settings); connect(); }

function connect() { close(); state.mode = "connecting"; render(); trySocket(); setTimeout(() => { if (state.mode === "connecting") tryStream("socket unavailable"); }, 1200); }
function trySocket() { try { socket = new WebSocket(wsUrl()); socket.onopen = () => { state.mode = "websocket"; status("WebSocket connected."); render(); }; socket.onmessage = msg => ingest(jsonParse(msg.data)); socket.onerror = () => tryStream("WebSocket error"); socket.onclose = () => { if (state.mode === "websocket") tryStream("WebSocket closed"); }; } catch (error) { tryStream(error.message); } }
function tryStream(reason) { closeSocket(); if (typeof EventSource === "undefined") return fallback(reason || "EventSource unavailable"); state.mode = "eventsource"; state.error = reason || ""; source = new EventSource(streamUrl()); source.onopen = () => { status("EventSource server-push connected."); render(); }; source.addEventListener("snapshot", event => ingest(jsonParse(event.data), "stream")); source.onerror = () => fallback("server-push stream unavailable"); render(); }
function fallback(reason) { closeSocket(); closeSource(); state.mode = "polling"; state.error = reason || "fallback"; status(`Fallback polling: ${state.error}`); snapshot("fallback"); poll = setInterval(() => snapshot("poll"), state.settings.pollMs); }
function pause() { close(); state.mode = "paused"; status("Live actions paused."); render(); }
function close() { clearInterval(poll); poll = 0; closeSocket(); closeSource(); }
function closeSocket() { if (socket) try { socket.close(); } catch {} socket = null; }
function closeSource() { if (source) try { source.close(); } catch {} source = null; }
function clear() { state.events = []; state.groups = []; state.selectedGroup = ""; state.selected = null; render(); }

async function snapshot(reason) { try { ingest(await getJson(httpUrl(), { credentials: "include" }), reason); } catch (e) { state.error = e.message; status(`Snapshot failed: ${state.error}`); render(); } }
function ingest(got, reason = "stream") { if (!got || got.ok === false) throw new Error(got?.error || "live_failed"); state.events = merge(state.events, got.events || got.event || []).slice(0, state.settings.limit); state.groups = got.groups || buildGroups(state.events); state.updatedAt = Date.now(); if (!state.selectedGroup && state.groups[0]) state.selectedGroup = state.groups[0].key; status(`${state.mode}: ${state.events.length} frames (${reason}).`); render(); }
function merge(oldRows, incoming) { const rows = Array.isArray(incoming) ? incoming : [incoming]; const map = new Map([...rows, ...oldRows].filter(Boolean).map(row => [row.id || `${row.action}-${row.at}-${row.path}`, row])); return [...map.values()].sort((a, b) => Number(b.at || 0) - Number(a.at || 0)); }
function buildGroups(events) { const by = state.settings.groupBy, groups = new Map(); for (const e of events) { const key = e.groupKeys?.[by] || e[by] || e.conversationId || "unknown"; const g = groups.get(key) || { key, title: key, count: 0, failed: 0, lastAt: 0 }; g.count++; if (e.ok === false) g.failed++; g.lastAt = Math.max(g.lastAt, Number(e.at || 0)); groups.set(key, g); } return [...groups.values()].sort((a, b) => b.lastAt - a.lastAt); }
function visible() { const by = state.settings.groupBy, q = state.settings.filter.toLowerCase(); return state.events.filter(e => (!state.selectedGroup || (e.groupKeys?.[by] || e[by] || e.conversationId || "unknown") === state.selectedGroup) && (!q || JSON.stringify(e).toLowerCase().includes(q))); }

function render() { renderKpis(); renderGroups(); renderFeed(); renderInspector(); }
function renderKpis() { const ok = state.events.filter(e => e.ok !== false).length, fail = state.events.length - ok; set("mode", state.mode); set("total", state.events.length); set("ok", ok); set("failed", fail); set("visible", visible().length); set("updated", state.updatedAt ? time(state.updatedAt) : "—"); }
function renderGroups() { const root = $("liveGroups"); if (!root) return; root.replaceChildren(...(state.groups.length ? state.groups : [{ key: "", title: "All actions", count: state.events.length }]).map(g => h("button", { className: `awt-live-group ${state.selectedGroup === g.key ? "is-active" : ""}`, on: { click: () => { state.selectedGroup = g.key; render(); } } }, [h("strong", { text: g.title || g.key || "All actions" }), h("small", { text: `${g.count || 0} frames · ${g.failed || 0} failed · ${time(g.lastAt)}` })]))); }
function renderFeed() { const root = $("liveWindow"); if (!root) return; const rows = visible().slice(0, 120); root.replaceChildren(...(rows.length ? rows.map(card) : [h("p", { className: "empty-state", text: "No matching live actions yet." })])); if ($("liveSummary")) $("liveSummary").textContent = `${rows.length} visible · ${state.events.length} buffered · ${state.settings.groupBy} channels`; }
function card(e) { return h("button", { className: "awt-live-card", data: { ok: e.ok !== false }, on: { click: () => { state.selected = e; renderInspector(); } } }, [h("span", { className: "awt-live-badge", text: e.ok === false ? "failed" : "ok" }), h("strong", { text: e.title || e.action || e.kind || "action" }), h("small", { text: `${e.conversationName || e.conversationId || "conversation"} · ${e.tunnelName || "tunnel"} · ${time(e.at)}` }), h("p", { text: e.path || e.summary || e.viewUrl || e.id || "" })]); }
function renderInspector() { const picked = state.selected || visible()[0] || null; if ($("liveOut")) $("liveOut").textContent = JSON.stringify(picked || { ok: true, message: "No frame selected." }, null, 2); }

function httpUrl() { const url = new URL("/api/tunnel/control/live-calls", location.origin); pack(url.searchParams); return url.toString(); }
function streamUrl() { const url = new URL("/api/tunnel/control/live-calls/stream", location.origin); pack(url.searchParams); return url.toString(); }
function wsUrl() { const url = new URL("/api/tunnel/control/live-calls/ws", location.origin.replace(/^http/, "ws")); pack(url.searchParams); return url.toString(); }
function pack(p) { p.set("groupBy", state.settings.groupBy); p.set("limit", state.settings.limit); if (state.settings.filter) p.set("filter", state.settings.filter); }
function status(text) { if ($("liveSocketState")) $("liveSocketState").textContent = text; }
function set(id, text) { const node = $(`liveKpi_${id}`); if (node) node.textContent = String(text); }
function jsonParse(text) { try { return JSON.parse(text); } catch { return {}; } }
function clamp(v, min, max) { return Math.max(min, Math.min(Number(v) || min, max)); }
function cap(s) { return s[0].toUpperCase() + s.slice(1); }
function time(v) { const d = new Date(Number(v || 0)); return Number.isFinite(d.getTime()) && d.getTime() ? d.toLocaleTimeString() : "—"; }
function debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }

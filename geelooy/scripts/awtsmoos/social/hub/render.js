// B"H
/**
 * @module SocialHubRender
 * @description
 * Chapter 461: The hub now reveals not only routes, but live sockets, email
 * bridges, governance, and the full social command surface as a luminous map.
 */

import { state, setActive, setField } from "./state.js";
import { liveState } from "./socket.js";

const panels = [
    ["overview", "Overview"], ["live", "Live Socket"], ["search", "Search"],
    ["feed", "Feed"], ["discover", "Discover"], ["profile", "Profiles"],
    ["graph", "Graph"], ["social", "Follows"], ["notifications", "Notifications"],
    ["admin", "Governance"], ["developer", "Developer"]
];
function esc(value) { return String(value ?? "").replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c])); }
function summary(result) {
    const data = result?.body?.data ?? result?.body?.success ?? result?.body;
    if (Array.isArray(data)) return `${data.length} items`;
    if (data?.items) return `${data.items.length} items`;
    if (data?.nodes) return `${data.nodes.length} nodes · ${(data.edges || []).length} edges`;
    if (data?.events) return `${data.events.length} events`;
    if (data?.canonicalNamespace) return data.canonicalNamespace;
    if (result?.body?.error) return result.body.error.code || result.body.error.message;
    return result?.ok ? "ready" : "not ready";
}
function card(title, key, hint = "") {
    const result = state.results[key];
    return `<article class="hub-card"><header><h3>${esc(title)}</h3><small>${esc(result ? summary(result) : hint)}</small></header><pre>${esc(result ? JSON.stringify(result.body, null, 2).slice(0, 2200) : "Run this panel to reveal live API data.")}</pre></article>`;
}
function inputRow() {
    return `<section class="hub-inputs">
        <label>Alias <input data-hub-field="alias" value="${esc(state.alias)}" /></label>
        <label>Target Alias <input data-hub-field="targetAlias" value="${esc(state.targetAlias)}" /></label>
        <label>Heichel <input data-hub-field="heichelId" value="${esc(state.heichelId)}" /></label>
        <label>Series <input data-hub-field="seriesId" value="${esc(state.seriesId)}" /></label>
        <label>Search / Live Text <input data-hub-field="query" value="${esc(state.query)}" placeholder="word, heichel, live spark…" /></label>
    </section>`;
}
function liveLog() {
    return `<article class="hub-card hub-live-card"><header><h3>WebSocket Pulse</h3><small>${esc(liveState.status)} · ${esc(liveState.channel)}</small></header><div class="hub-live-actions"><button data-hub-action="connectLive">Connect</button><button data-hub-action="publishLive">Publish spark</button></div><pre>${esc(JSON.stringify(liveState.messages.slice(0, 18), null, 2))}</pre></article>`;
}
function overview() { return `${card("API Meta", "meta", "canonical namespace")}${card("OpenAPI", "openapi", "route map")}${card("V2 Removed Probe", "v2Gone", "should be INVALID_ROUTE")}${card("Route Health", "routeHealth", "4 probes")}`; }
function live() { return `${liveLog()}${card("HTTP Live Subscribe", "liveSubscribe", "channel subscribe")}${card("HTTP Live Presence", "livePresence", "presence")}${card("HTTP Live Publish", "livePublish", "fallback publish")}${card("HTTP Live Replay", "liveReplay", "event replay")}`; }
function search() { return `${card("Global Search", "search", "aliases + query")}${card("Heichel Discovery", "discover", "find palaces")}`; }
function feed() { return `${card("Personal/Home Feed", "feedHome", "platform home")}${card("Profile Feed", "feed", "posts/comments")}${card("Trending", "trending", "ranked activity")}${card("Events", "events", "event-shaped river")}`; }
function discover() { return `${card("Heichel Discovery", "discover", "search heichelos")}${card("Recommendations", "recommendations", "nearby paths")}`; }
function profile() { return `${card("Profile Aggregate", "profile", "identity hub")}${card("Activity", "activity", "timeline")}${card("History", "history", "continue reading")}${card("Analytics", "analytics", "owner metrics")}`; }
function graph() { return `${card("Profile Graph", "graph", "nodes and edges")}`; }
function social() { return `${card("Following", "follows", "entities followed")}${card("Followers", "followers", "alias followers")}${card("Follow Action", "follow", "target alias")}`; }
function notifications() { return `${card("Notifications", "notifications", "inbox")}${card("Unread Count", "unreadCount", "count")}${card("Create Notification", "notify", "synthetic UI note")}`; }
function admin() { return `${card("Submission Settings", "submissionSettings", "governance")}${card("Editors", "editors", "permissions")}${card("Migration Dry Run", "migrationDryRun", "safe migration probe")}`; }
function developer() { return `${card("OpenAPI", "openapi", "schema")}${card("Key Verify", "keysVerify", "optional api key")}${card("Cache Miss", "cacheMiss", "safe cache probe")}${card("Route Health", "routeHealth", "live endpoints")}`; }
function body() { const map = { overview, live, search, feed, discover, profile, graph, social, notifications, admin, developer }; return `<section class="hub-panel-grid">${(map[state.active] || overview)()}</section>`; }

export function render(root, actions) {
    root.innerHTML = `<div class="hub-shell"><aside class="hub-rail"><div class="hub-seal">B"H</div><h1>Social Hub</h1><p>One unified /api/social command palace, with WebSocket life.</p>${panels.map(([key, label]) => `<button class="${state.active === key ? "active" : ""}" data-hub-tab="${key}">${esc(label)}</button>`).join("")}<a class="hub-mail-tag" href="/email">✉ Unified Mail</a></aside><section class="hub-main"><header class="hub-hero"><div><p>Awtsmoos Social API</p><h2>Every feature, one beautiful live interface.</h2><span>${state.busy ? "Running…" : "Ready"}${state.error ? " · " + esc(state.error) : ""}</span></div><button data-hub-action="runActive">Run ${esc(state.active)}</button><button data-hub-action="runAll">Run all safe panels</button></header>${inputRow()}${body()}</section></div>`;
    root.querySelectorAll("[data-hub-tab]").forEach(btn => btn.addEventListener("click", () => { setActive(btn.dataset.hubTab); actions.repaint(); }));
    root.querySelectorAll("[data-hub-field]").forEach(input => input.addEventListener("input", () => setField(input.dataset.hubField, input.value)));
    root.querySelectorAll("[data-hub-action]").forEach(btn => btn.addEventListener("click", () => actions[btn.dataset.hubAction]?.()));
}

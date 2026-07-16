// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubRenderMarkup
 * @description
 * The Awtsmoos translates Social Hub state into semantic Awtsmoos.com markup:
 * labelled fields, truthful status, contained result cards, and coherent routes.
 */

import { state } from "./state.js";
import { liveState } from "./socket.js";
import { panelCards, panelCopy, panelTabs } from "./renderConfig.js";

const fields = [
	["alias", "Alias", "Identity used for profile and feed requests."],
	["targetAlias", "Target alias", "Identity used by relationship actions."],
	["heichelId", "Heichel", "Community destination and governance context."],
	["seriesId", "Series", "Series or root collection inside the Heichel."],
	["query", "Search / live text", "Query text or the next live socket spark.", true]
];

export function escapeHtml(value) {
	return String(value ?? "").replace(/[&<>'"]/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"'": "&#39;",
		'"': "&quot;"
	}[character]));
}

function resultData(result) {
	return result?.body?.data ?? result?.body?.success ?? result?.body;
}

function resultSummary(result, hint) {
	const data = resultData(result);
	if (!result) return hint;
	if (Array.isArray(data)) return `${data.length} items`;
	if (data?.items) return `${data.items.length} items`;
	if (data?.nodes) return `${data.nodes.length} nodes · ${(data.edges || []).length} edges`;
	if (data?.events) return `${data.events.length} events`;
	if (data?.canonicalNamespace) return data.canonicalNamespace;
	if (result?.body?.error) return result.body.error.code || result.body.error.message;
	return result.ok ? "ready" : "not ready";
}

function resultState(result) {
	if (!result) return "idle";
	return result.ok ? "ready" : "error";
}

function cardMarkup([title, key, hint]) {
	const result = state.results[key];
	const body = result
		? JSON.stringify(result.body, null, 2).slice(0, 5000)
		: "Run this panel to reveal live API data.";
	return `
		<article class="hub-card" data-state="${resultState(result)}">
			<header><h3>${escapeHtml(title)}</h3><small>${escapeHtml(resultSummary(result, hint))}</small></header>
			<pre class="${result ? "" : "hub-empty-copy"}">${escapeHtml(body)}</pre>
		</article>
	`;
}

function fieldMarkup([key, label, description, wide = false]) {
	const fieldId = `hub-field-${key}`;
	return `
		<label class="hub-field${wide ? " hub-field-wide" : ""}" for="${fieldId}">
			<span>${escapeHtml(label)}</span>
			<input id="${fieldId}" data-hub-field="${key}" value="${escapeHtml(state[key])}" aria-describedby="${fieldId}-hint" autocomplete="off">
			<small id="${fieldId}-hint">${escapeHtml(description)}</small>
		</label>
	`;
}

function inputSectionMarkup() {
	return `
		<section class="hub-input-section" aria-labelledby="hub-context-title">
			<div class="hub-input-heading"><div><h3 id="hub-context-title">Request context</h3><p>Change identity, destination, or query without leaving this route.</p></div></div>
			<div class="hub-inputs">${fields.map(fieldMarkup).join("")}</div>
		</section>
	`;
}

function liveCardMarkup() {
	const messages = JSON.stringify(liveState.messages.slice(0, 18), null, 2);
	return `
		<article class="hub-card hub-live-card" data-state="${liveState.connected ? "ready" : "idle"}">
			<header><h3>WebSocket pulse</h3><small>${escapeHtml(liveState.status)} · ${escapeHtml(liveState.channel)}</small></header>
			<div class="hub-live-actions"><button type="button" data-hub-action="connectLive">Connect</button><button type="button" data-hub-action="publishLive">Publish spark</button></div>
			<pre class="${messages === "[]" ? "hub-empty-copy" : ""}">${escapeHtml(messages === "[]" ? "No live messages yet." : messages)}</pre>
		</article>
	`;
}

function panelMarkup() {
	const cards = (panelCards[state.active] || panelCards.overview).map(cardMarkup).join("");
	return `<section class="hub-panel-grid" aria-label="${escapeHtml(state.active)} results">${state.active === "live" ? liveCardMarkup() : ""}${cards}</section>`;
}

function railMarkup() {
	const tabs = panelTabs.map(([key, label]) => `<button type="button" class="${state.active === key ? "active" : ""}" data-hub-tab="${key}" aria-pressed="${state.active === key}">${escapeHtml(label)}</button>`).join("");
	return `<aside class="hub-rail"><div class="hub-rail-head"><div class="hub-seal">B"H</div><div class="hub-rail-copy"><h1>Social Hub</h1><p>One living social command surface.</p></div></div><nav class="hub-rail-tabs" aria-label="Social Hub sections">${tabs}</nav><a class="hub-mail-tag" href="/email">✉ Unified Mail</a></aside>`;
}

function heroMarkup() {
	const [title, description] = panelCopy[state.active] || panelCopy.overview;
	const tone = state.error ? "error" : state.busy ? "busy" : "ready";
	const status = state.error || (state.busy ? "Running requests…" : "Ready for a new request");
	return `<header class="hub-hero"><div class="hub-hero-copy"><p class="hub-kicker">Awtsmoos Social API</p><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p><span class="hub-status" data-tone="${tone}" role="status" aria-live="polite">${escapeHtml(status)}</span></div><div class="hub-hero-actions"><button type="button" data-hub-action="runActive" data-primary="true" ${state.busy ? "disabled" : ""}>Run ${escapeHtml(state.active)}</button><button type="button" data-hub-action="runAll" ${state.busy ? "disabled" : ""}>Run all panels</button></div></header>`;
}

export function shellMarkup() {
	return `<div class="hub-shell">${railMarkup()}<main class="hub-main" aria-busy="${state.busy}">${heroMarkup()}${inputSectionMarkup()}${panelMarkup()}</main></div>`;
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubRenderMarkup
 * @description
 * The Awtsmoos gives Social one readable horizon: context, safe exploration,
 * deliberate action, and exact evidence. Awtsmoos.com lets this shell compose
 * small focused vessels rather than forcing every concern into one file.
 */

import { cardsMarkup } from "./renderCards.js";
import { escapeHtml } from "./htmlEscape.js";
import { panelCopy, panelTabs } from "./renderConfig.js";
import { state } from "./state.js";

const FIELDS = [
	["alias", "Acting alias", "Identity used for profile, feed, and mutations."],
	["targetAlias", "Target alias", "Identity used only by explicit relationship actions."],
	["heichelId", "Heichel", "Community destination and governance context."],
	["seriesId", "Series", "Series or root collection inside the Heichel."],
	["query", "Search / live text", "Query text or the next explicit live spark.", true]
];

export function shellMarkup() {
	return `<div class="hub-shell">${railMarkup()}<main class="hub-main" aria-busy="${state.busy}">${heroMarkup()}${inputSectionMarkup()}${cardsMarkup(state.active)}</main></div>`;
}

function fieldMarkup([key, label, description, wide = false]) {
	const id = `hub-field-${key}`;
	return `<label class="hub-field${wide ? " hub-field-wide" : ""}" for="${id}">
		<span>${escapeHtml(label)}</span>
		<input id="${id}" data-hub-field="${key}" value="${escapeHtml(state[key])}" aria-describedby="${id}-hint" autocomplete="off">
		<small id="${id}-hint">${escapeHtml(description)}</small>
	</label>`;
}

function inputSectionMarkup() {
	const fields = FIELDS.map(fieldMarkup).join("");
	return `<section class="hub-input-section" aria-labelledby="hub-context-title">
		<div class="hub-input-heading"><div><h3 id="hub-context-title">Request context</h3><p>Context changes what you inspect. It does not mutate social state until you choose an Act control.</p></div></div>
		<div class="hub-inputs">${fields}</div>
	</section>`;
}

function railMarkup() {
	const tabs = panelTabs.map(tabMarkup).join("");
	return `<aside class="hub-rail">
		<div class="hub-rail-head"><div class="hub-seal">B"H</div><div class="hub-rail-copy"><h1>Social Observatory</h1><p>Explore widely. Act deliberately.</p></div></div>
		<nav class="hub-rail-tabs" aria-label="Social sections">${tabs}</nav>
		<div class="hub-rail-links"><a class="hub-mail-tag" href="/social-hub/">Interaction Studio</a><a class="hub-mail-tag" href="/email/">Quantum Mail</a><a class="hub-mail-tag" href="/notifications/">Signals</a></div>
	</aside>`;
}

function tabMarkup([key, label]) {
	return `<button type="button" class="${state.active === key ? "active" : ""}" data-hub-tab="${key}" aria-pressed="${state.active === key}">${escapeHtml(label)}</button>`;
}

function heroMarkup() {
	const [title, description] = panelCopy[state.active] || panelCopy.overview;
	const tone = state.error ? "error" : state.busy ? "busy" : "ready";
	const status = state.error
		|| (state.busy ? "Exploring current social state…" : "Ready · bulk controls are read-only");
	return `<header class="hub-hero">
		<div class="hub-hero-copy"><p class="hub-kicker">Awtsmoos Social Observatory</p><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p><span class="hub-status" data-tone="${tone}" role="status" aria-live="polite">${escapeHtml(status)}</span></div>
		<div class="hub-hero-actions"><button type="button" data-hub-action="runActive" data-primary="true" ${state.busy ? "disabled" : ""}>Explore ${escapeHtml(state.active)}</button><button type="button" data-hub-action="runAll" ${state.busy ? "disabled" : ""}>Explore all read-only panels</button></div>
	</header>`;
}

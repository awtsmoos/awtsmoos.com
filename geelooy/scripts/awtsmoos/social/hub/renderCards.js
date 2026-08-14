// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubRenderCards
 * @description
 * The Awtsmoos contains both evidence and consequence. Awtsmoos.com keeps normal
 * cards focused on read evidence and explicit HTTP mutations while real-time side
 * effects live in their own renderer with equally visible consequence language.
 */

import { escapeHtml } from "./htmlEscape.js";
import { policyForKey } from "./operationPolicy.js";
import { mutationCards, panelCards } from "./renderConfig.js";
import { liveCardMarkup } from "./renderLiveCard.js";
import { digestResult, rawResult } from "./resultDigest.js";
import { state } from "./state.js";

export function cardsMarkup(active) {
	const reads = (panelCards[active] || panelCards.overview)
		.map(readCardMarkup)
		.join("");
	const mutations = (mutationCards[active] || [])
		.map(mutationCardMarkup)
		.join("");
	const live = active === "live" ? liveCardMarkup() : "";
	return `${readSectionMarkup(live, reads)}${mutationSectionMarkup(mutations)}`;
}

function readCardMarkup([title, key, hint]) {
	const result = state.results[key];
	const digest = digestResult(result, hint);
	return `<article class="hub-card hub-read-card" data-state="${resultState(result)}">
		<header><div><span class="hub-mode-badge" data-mode="read">Read only</span><h3>${escapeHtml(title)}</h3></div><small>${escapeHtml(digest.headline)}</small></header>
		<div class="hub-result-digest"><strong>${escapeHtml(digest.headline)}</strong><p>${escapeHtml(digest.detail)}</p>${retryMarkup(result, key)}</div>
		${rawDetailsMarkup(result)}
	</article>`;
}

function mutationCardMarkup([title, key]) {
	const policy = policyForKey(key);
	const result = state.results[key];
	const digest = digestResult(result, "No mutation has been performed in this session.");
	return `<article class="hub-card hub-mutation-card" data-state="${resultState(result)}">
		<header><div><span class="hub-mode-badge" data-mode="mutation">Changes data</span><h3>${escapeHtml(title)}</h3></div></header>
		<p class="hub-consequence">${escapeHtml(policy.consequence)}</p>
		<button type="button" class="hub-mutation-trigger" data-hub-mutation="${key}" ${state.busy ? "disabled" : ""}>${escapeHtml(policy.label)}</button>
		${resultMarkup(result, digest)}
	</article>`;
}

function readSectionMarkup(live, reads) {
	return `<section class="hub-mode-section"><header><span class="hub-mode-badge" data-mode="read">Explore</span><h3>Read current social state</h3></header><div class="hub-panel-grid">${live}${reads}</div></section>`;
}

function mutationSectionMarkup(mutations) {
	if (!mutations) {
		return "";
	}
	return `<section class="hub-mode-section hub-act-section"><header><span class="hub-mode-badge" data-mode="mutation">Act</span><h3>Deliberate changes</h3></header><div class="hub-panel-grid">${mutations}</div></section>`;
}

function resultMarkup(result, digest) {
	if (!result) {
		return "";
	}
	return `<div class="hub-result-digest"><strong>${escapeHtml(digest.headline)}</strong><p>${escapeHtml(digest.detail)}</p></div>${rawDetailsMarkup(result)}`;
}

function rawDetailsMarkup(result) {
	if (!result) {
		return `<p class="hub-empty-copy">Explore this card to read current API data.</p>`;
	}
	return `<details class="hub-raw-details"><summary>Advanced · Raw API response</summary><pre>${escapeHtml(rawResult(result))}</pre></details>`;
}

function retryMarkup(result, key) {
	if (!result || result.ok) {
		return "";
	}
	return `<button type="button" data-hub-retry="${key}">Retry this read</button>`;
}

function resultState(result) {
	if (!result) {
		return "idle";
	}
	return result.ok ? "ready" : "error";
}

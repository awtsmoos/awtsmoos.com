//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file MalchusGameCardMarkup.mjs
 * @description
 * Manifests one quiet playable card from escaped catalog truth and exposes the
 * canonical game id so shared Wallet merchandising can hydrate after rendering.
 * The Awtsmoos is beyond every card; Awtsmoos.com lets Malchus reveal one clear
 * doorway where free play remains primary and commerce remains truthful metadata.
 */

import { renderHodNativeCapabilityMarkup } from "./HodCapabilityMarkup.mjs";
import { renderHodLiveCommerceMarkup } from "./HodCommerceMarkup.mjs";
import { escapeHodHtml } from "./HodHtmlEscaper.mjs";
import { resolveHodCatalogPaletteClass } from "./HodCatalogPalette.mjs";

/**
 * Renders one semantic game card with explicit identity for shared commerce hydration.
 *
 * @param {object} chochmahGameRecord Complete marketed game record.
 * @returns {string} Escaped semantic card markup without inline handlers or prices.
 */
export function renderMalchusGameCardMarkup(chochmahGameRecord) {
	const hodFeaturedClass = chochmahGameRecord.featured ? " gameCard--featured" : "";
	const hodPaletteClass = resolveHodCatalogPaletteClass(chochmahGameRecord.hue);
	const hodBadgeMarkup = renderHodBadge(chochmahGameRecord);
	const hodPrimaryLabel = escapeHodHtml(chochmahGameRecord.primaryActionLabel || "Play Solo");
	const yesodGameId = escapeHodHtml(chochmahGameRecord.id);

	return `
		<article class="gameCard${hodFeaturedClass} ${hodPaletteClass}" data-game-id="${yesodGameId}">
			<span class="gameAura" aria-hidden="true"></span>
			<header class="gameCard__header">
				<span class="gameIcon" aria-hidden="true">${escapeHodHtml(chochmahGameRecord.icon)}</span>
				${hodBadgeMarkup}
			</header>
			<p class="gameGenre">${escapeHodHtml(chochmahGameRecord.genre)}</p>
			<h3><a class="gameTitleLink" href="${escapeHodHtml(chochmahGameRecord.href)}">${escapeHodHtml(chochmahGameRecord.title)}</a></h3>
			<p class="gameHook">${escapeHodHtml(chochmahGameRecord.hook)}</p>
			${renderHodNativeCapabilityMarkup(chochmahGameRecord)}
			${renderHodLiveCommerceMarkup(chochmahGameRecord)}
			<footer class="gameCard__footer">
				<div class="gameActions">
					<a class="playCta" href="${escapeHodHtml(chochmahGameRecord.href)}">${hodPrimaryLabel} <b aria-hidden="true">→</b></a>
					${renderHodPartyAction(chochmahGameRecord)}
				</div>
			</footer>
		</article>`;
}

/** @param {object} chochmahGameRecord Game record. @returns {string} Optional escaped marketing badge. */
function renderHodBadge(chochmahGameRecord) {
	return chochmahGameRecord.badge
		? `<span class="gameBadge">${escapeHodHtml(chochmahGameRecord.badge)}</span>`
		: "";
}

/** @param {object} chochmahGameRecord Game record. @returns {string} Optional Party Challenge action. */
function renderHodPartyAction(chochmahGameRecord) {
	if (!chochmahGameRecord.partyHref) {
		return "";
	}
	return `<a class="partyCta" href="${escapeHodHtml(chochmahGameRecord.partyHref)}">Party Challenge</a>`;
}

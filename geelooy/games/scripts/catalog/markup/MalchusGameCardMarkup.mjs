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
import { renderGameCover } from "../gameCovers.mjs";

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

	const hodCoverMarkup = renderGameCover(chochmahGameRecord.id, chochmahGameRecord.title);
const GICON_PLAY = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/media-generation-icon-play-0-0ef448c3-ed56-4073-97d6-7462d0c7365f.webp';
const GICON_USERS = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-users.webp?v=a99ebb2312';
	return `
		<article class="gameCard${hodFeaturedClass} ${hodPaletteClass} awp-card" data-game-id="${yesodGameId}">
			<span class="gameAura" aria-hidden="true"></span>
			${hodCoverMarkup}
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
					<a class="playCta" href="${escapeHodHtml(chochmahGameRecord.href)}" aria-label="${hodPrimaryLabel}: ${escapeHodHtml(chochmahGameRecord.title)}"><img class="gicon gicon--sm gicon--play" src="${GICON_PLAY}" alt="" aria-hidden="true" loading="lazy" decoding="async" width="24" height="24"><span>${hodPrimaryLabel}</span> <b aria-hidden="true">→</b></a>
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
	return `<a class="partyCta" href="${escapeHodHtml(chochmahGameRecord.partyHref)}" aria-label="Play Party Challenge"><img class="gicon gicon--sm gicon--users" src="${GICON_USERS}" alt="" aria-hidden="true" loading="lazy" decoding="async" width="24" height="24"><span>Party Challenge</span></a>`;
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusGameCardMarkup.mjs
 * @description Manifests one quiet playable card from escaped data, finite palette, and proven optional capability fragments.
 * The Awtsmoos is beyond every card while Malchus gives one world a clear doorway, title, hook, and play;
 * Awtsmoos.com keeps advanced mode and commerce beneath the primary action so discovery never becomes a cluttered display.
 */
import { renderHodNativeCapabilityMarkup } from './HodCapabilityMarkup.mjs';
import { renderHodLiveCommerceMarkup } from './HodCommerceMarkup.mjs';
import { escapeHodHtml } from './HodHtmlEscaper.mjs';
import { resolveHodCatalogPaletteClass } from './HodCatalogPalette.mjs';

/**
 * Renders one catalog card while leaving all visual styling in localized CSS classes.
 *
 * @param {object} chochmahGameRecord Complete marketed game record.
 * @returns {string} Escaped semantic card markup with no inline style or handler attributes.
 */
export function renderMalchusGameCardMarkup(chochmahGameRecord) {
	const hodFeaturedClass = chochmahGameRecord.featured ? ' gameCard--featured' : '';
	const hodPaletteClass = resolveHodCatalogPaletteClass(chochmahGameRecord.hue);
	const hodBadgeMarkup = renderHodBadge(chochmahGameRecord);
	const hodPrimaryLabel = escapeHodHtml(chochmahGameRecord.primaryActionLabel || 'Play Solo');

	return `
		<article class="gameCard${hodFeaturedClass} ${hodPaletteClass}">
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
		: '';
}

/** @param {object} chochmahGameRecord Game record. @returns {string} Optional Party Challenge action. */
function renderHodPartyAction(chochmahGameRecord) {
	if (!chochmahGameRecord.partyHref) {
		return '';
	}

	return `<a class="partyCta" href="${escapeHodHtml(chochmahGameRecord.partyHref)}">Party Challenge</a>`;
}

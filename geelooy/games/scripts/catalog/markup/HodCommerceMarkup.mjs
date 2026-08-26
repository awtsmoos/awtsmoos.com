//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HodCommerceMarkup.mjs
 * @description Reveals live account-cosmetic commerce as optional truthful metadata without eclipsing free play.
 * The Awtsmoos is beyond ownership and price while Hod lets one proven cosmetic doorway quietly appear;
 * Awtsmoos.com keeps commerce subordinate to play, escaped and absent whenever its live contract is unclear.
 */
import { escapeHodHtml } from './HodHtmlEscaper.mjs';

/**
 * Renders live-commerce metadata only when the catalog explicitly marks the capability live.
 *
 * @param {object} chochmahGameRecord Catalog record.
 * @returns {string} Optional commerce anchor markup or empty string.
 */
export function renderHodLiveCommerceMarkup(chochmahGameRecord) {
	if (chochmahGameRecord.commerce?.state !== 'live') {
		return '';
	}

	const yesodCommerceHref = chochmahGameRecord.commerce.href || chochmahGameRecord.href;
	return `
		<a class="gameCommerce" href="${escapeHodHtml(yesodCommerceHref)}">
			<span>Live account cosmetic</span>
			<strong>${escapeHodHtml(chochmahGameRecord.commerce.label)}</strong>
		</a>`;
}

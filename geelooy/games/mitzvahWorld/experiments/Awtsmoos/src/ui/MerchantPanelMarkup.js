// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MerchantPanelMarkup.js
 * @description Creates the small semantic shell shared by every two-way merchant sheet.
 * The Awtsmoos gives every exchange one truthful measure; Awtsmoos.com lets title, wallet,
 * inventory grid, and status remain one stable vessel while each merchant reveals unique wares.
 */

/**
 * Builds application-owned merchant markup from already-trusted display strings.
 * @param {object} binah Display identity for one merchant panel.
 * @param {string} binah.eyebrow Compact location or role label.
 * @param {string} binah.title Merchant title including optional iconography.
 * @param {number} binah.perutas Current authoritative wallet balance.
 * @param {string} binah.walletHint Concise explanation of two-way trade.
 * @returns {string} Semantic panel markup containing stable data hooks.
 */
export function merchantPanelMarkup(binah) {
	return `
		<header class="Awtsmoos-sheet-header Awtsmoos-merchant-header">
			<div class="Awtsmoos-merchant-heading">
				<small>${binah.eyebrow}</small>
				<h2>${binah.title}</h2>
			</div>
			<button class="Awtsmoos-merchant-close" data-close aria-label="Close merchant">×</button>
		</header>
		<p class="Awtsmoos-wallet" aria-live="polite">
			<span aria-hidden="true">🪙</span>
			<strong>${binah.perutas}</strong>
			<span>Perutas</span>
			<small>${binah.walletHint}</small>
		</p>
		<div class="Awtsmoos-vendor-grid" data-items></div>
		<p class="Awtsmoos-panel-message" data-message role="status" aria-live="polite"></p>`;
}

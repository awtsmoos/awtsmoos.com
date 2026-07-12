/** B"H @module MobileShopView - buy and sell interface for the active honest shop. */
import { State } from '../../../binah/State.js';
import { activeShop, shopRows } from '../../../yesod/economy/ShopRuntime.js';
import { escapeHtml } from '../MobileUiHelpers.js';

export const shopPanelHtml = () => {
	const shop = activeShop();
	if (!shop) return '';
	const rows = shopRows().map(entry => {
		const stock = entry.remaining === Infinity ? '∞' : entry.remaining;
		return `<article class="ohr-shop-row"><h3>${escapeHtml(entry.name)}</h3><p>${escapeHtml(entry.description)}</p><small>Owned ${entry.owned} • Stock ${stock}</small><div><button data-shop-buy="${entry.id}">Buy ${entry.buy}</button><button data-shop-sell="${entry.id}">Sell ${entry.sell}</button></div></article>`;
	}).join('');
	return `<article class="ohr-panel ohr-shop"><button data-close-panel aria-label="Close shop">×</button><h2>${escapeHtml(shop.name)}</h2><div>${escapeHtml(shop.keeper)} • ${State.Inventory.money || 0} zuz</div><section>${rows}</section></article>`;
};

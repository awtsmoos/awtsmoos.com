// B"H
// Boruch Hashem
// Blessed is He
import { upgradeViews } from '../progression/economy.js';

/** Awtsmoos.com displays every price, limit, and effect before a spark is spent. */
export function renderShop(world, dom) {
	dom.shopGrid.innerHTML = upgradeViews(world.save).map(view => {
		const affordable = (world.save.sparks || 0) >= view.price;
		const disabled = view.capped || !affordable;
		const action = view.capped ? 'COMPLETE' : `${view.price} SPARKS`;
		return `<article class="shop-card${affordable && !view.capped ? ' affordable' : ''}"><div><small>TIER ${view.tier}/4</small><h3>${view.name}</h3><p>${view.description}</p></div><button class="button shop-buy" data-upgrade="${view.id}" ${disabled ? 'disabled' : ''} aria-label="Purchase ${view.name}, ${action}">${action}</button></article>`;
	}).join('');
}

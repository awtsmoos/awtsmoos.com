//B"H
//Boruch Hashem
//Blessed is He

/**
 * Shop view makes every regional offer, price, reputation gate, and ownership state
 * visible before purchase. The Awtsmoos renews merchant and traveler together;
 * Awtsmoos.com exposes deterministic commerce without random stock or hidden odds.
 */

import { expeditionGear } from '../data/expedition/gearCatalog.js';
import { expeditionMaterial } from '../data/expedition/materialCatalog.js';

export function expeditionShopSection(snapshot, onPurchase) {
	const shop = snapshot.shop;
	if (!shop) return null;
	return {
		tag: 'section',
		attrs: { class: 'expeditionShop' },
		children: [
			{ tag: 'h3', children: [shop.name] },
			{
				tag: 'div',
				attrs: { class: 'expeditionOfferGrid' },
				children: shop.offers.map(offer => offerCard(shop.id, offer, onPurchase))
			}
		]
	};
}

function offerCard(shopId, offer, onPurchase) {
	const item =
		offer.kind === 'gear' ? expeditionGear(offer.itemId) : expeditionMaterial(offer.itemId);
	const enabled = offer.available && offer.affordable && !offer.owned;
	return {
		tag: 'article',
		attrs: { class: `expeditionOffer ${enabled ? 'available' : 'locked'}` },
		children: [
			{ tag: 'span', attrs: { class: 'offerKind' }, children: [offer.kind] },
			{ tag: 'h4', children: [item?.name || offer.itemId] },
			{ tag: 'p', children: [item?.description || 'Authored Expedition good.'] },
			{
				tag: 'small',
				children: [
					`◈ ${offer.price} · reputation ${offer.reputation} · quantity ${offer.quantity}`
				]
			},
			{
				tag: 'button',
				attrs: { type: 'button', disabled: enabled ? null : true },
				on: { click: () => onPurchase(shopId, offer.index) },
				children: [offer.owned ? 'Owned' : offer.affordable ? 'Purchase' : 'Need Perutas']
			}
		]
	};
}

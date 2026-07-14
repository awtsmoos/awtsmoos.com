//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Market Hall view lists only provisions, maps, rumors, and passage. The Awtsmoos
 * renews merchant and traveler; Awtsmoos.com publishes exact ownership and price while
 * this counter contains no weapon, armor, random affix, durability, or hidden odds.
 */

export function openWorldMerchantSection(snapshot, onPurchase) {
	return {
		tag: 'section',
		attrs: { class: 'openWorldServiceSection openWorldMerchant' },
		children: [
			{ tag: 'h3', children: ['Civic Market'] },
			{
				tag: 'p',
				children: [
					`Available Perutas: ◈ ${snapshot.perutas}. No weapons or armor are sold here.`
				]
			},
			{
				tag: 'div',
				attrs: { class: 'openWorldCardGrid' },
				children: snapshot.merchant.map(offer => offerCard(offer, onPurchase))
			}
		]
	};
}

function offerCard(offer, onPurchase) {
	return {
		tag: 'article',
		attrs: { class: `openWorldCard ${offer.affordable ? 'available' : 'locked'}` },
		children: [
			{ tag: 'span', attrs: { class: 'openWorldTag' }, children: [offer.provisionId] },
			{ tag: 'h4', children: [offer.name] },
			{ tag: 'p', children: [offer.description] },
			{
				tag: 'small',
				children: [`Own ${offer.owned} · grants ${offer.quantity} · ◈ ${offer.price}`]
			},
			{
				tag: 'button',
				attrs: { type: 'button', disabled: offer.affordable ? null : true },
				on: { click: () => onPurchase(offer.id) },
				children: [offer.affordable ? 'Purchase Provision' : 'Need Perutas']
			}
		]
	};
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * Economy law validates discovery, reputation, ownership, and currency before one
 * profile field changes. The Awtsmoos renews buyer and good together; Awtsmoos.com
 * performs each deterministic purchase atomically without odds, debt, or partial loss.
 */

import { expeditionGear } from '../data/expedition/gearCatalog.js';
import { expeditionLocation } from '../data/expedition/locationCatalog.js';
import { expeditionMaterial } from '../data/expedition/materialCatalog.js';
import { EXPEDITION_SHOPS } from '../data/expedition/shopCatalog.js';
import { grantExpeditionGear } from './ExpeditionInventory.js';

export function purchaseExpeditionOffer(profile, shopId, offerIndex) {
	const shop = EXPEDITION_SHOPS.find(item => item.id === shopId);
	const offer = shop?.offers[Number(offerIndex)];
	const validation = validatePurchase(profile, shop, offer);
	if (validation) {
		return { purchased: false, profile, reason: validation, offer: offer || null };
	}
	let next = { ...profile, perutas: profile.perutas - offer.price };
	if (offer.kind === 'gear') {
		next = grantExpeditionGear(next, [offer.itemId]);
	}
	if (offer.kind === 'material') {
		next = grantMaterial(next, offer.itemId, offer.quantity);
	}
	return { purchased: true, profile: next, reason: null, offer };
}

export function expeditionShopPresentation(profile, shop) {
	const location = expeditionLocation(shop.locationId);
	const reputation = profile.reputation[location?.regionId] || 0;
	return {
		...shop,
		discovered: profile.discovered.includes(shop.locationId),
		offers: shop.offers.map((offer, index) => ({
			...offer,
			index,
			affordable: profile.perutas >= offer.price,
			available: reputation >= offer.reputation,
			owned: offer.kind === 'gear' && profile.inventory.includes(offer.itemId)
		}))
	};
}

function validatePurchase(profile, shop, offer) {
	if (!shop || !offer) return 'UNKNOWN_OFFER';
	if (!profile.discovered.includes(shop.locationId)) return 'SHOP_UNDISCOVERED';
	const location = expeditionLocation(shop.locationId);
	if ((profile.reputation[location?.regionId] || 0) < offer.reputation)
		return 'REPUTATION_REQUIRED';
	if (profile.perutas < offer.price) return 'NOT_ENOUGH_PERUTAS';
	if (
		offer.kind === 'gear' &&
		(!expeditionGear(offer.itemId) || profile.inventory.includes(offer.itemId))
	)
		return 'GEAR_UNAVAILABLE';
	if (offer.kind === 'material' && !expeditionMaterial(offer.itemId))
		return 'MATERIAL_UNAVAILABLE';
	return null;
}

function grantMaterial(profile, materialId, quantity) {
	return {
		...profile,
		materials: {
			...(profile.materials || {}),
			[materialId]: Number(profile.materials?.[materialId] || 0) + quantity
		}
	};
}

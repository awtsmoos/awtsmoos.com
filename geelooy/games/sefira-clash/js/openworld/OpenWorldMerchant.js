//B"H
//Boruch Hashem
//Blessed is He

/**
 * Civic merchant law validates price and purpose before changing one Peruta. The
 * Awtsmoos renews buyer, bread, map, and rumor; Awtsmoos.com sells no weapon, armor,
 * randomized affix, or hidden combat advantage through this lived-world counter.
 */

import { OPEN_WORLD_INTERIORS } from '../data/openworld/OpenWorldInteriorCatalog.js';
import {
	openWorldMerchantOffer,
	OPEN_WORLD_MERCHANT_OFFERS
} from '../data/openworld/OpenWorldMerchantCatalog.js';

export function openWorldMerchantPresentation(profile) {
	return OPEN_WORLD_MERCHANT_OFFERS.map(offer => ({
		...offer,
		affordable: profile.perutas >= offer.price,
		owned: Number(profile.openWorld.provisions[offer.provisionId] || 0)
	}));
}

export function purchaseOpenWorldProvision(profile, offerId, locationId) {
	const offer = openWorldMerchantOffer(offerId);
	if (!offer) return { purchased: false, profile, reason: 'UNKNOWN_OFFER' };
	if (profile.perutas < offer.price) {
		return { purchased: false, profile, reason: 'INSUFFICIENT_PERUTAS' };
	}
	const provisions = {
		...profile.openWorld.provisions,
		[offer.provisionId]:
			Number(profile.openWorld.provisions[offer.provisionId] || 0) + offer.quantity
	};
	const openWorld = applySpecialProvision(
		{ ...profile.openWorld, provisions },
		offer,
		locationId
	);
	return {
		purchased: true,
		offer,
		profile: { ...profile, perutas: profile.perutas - offer.price, openWorld },
		event: {
			type: 'purchaseProvision',
			targetId: offer.provisionId,
			locationId,
			count: offer.quantity
		}
	};
}

function applySpecialProvision(openWorld, offer, locationId) {
	if (offer.provisionId === 'map') {
		return {
			...openWorld,
			knownDoors: [
				...new Set([
					...openWorld.knownDoors,
					...OPEN_WORLD_INTERIORS.map(interior => `${locationId}:${interior.id}`)
				])
			]
		};
	}
	if (offer.provisionId === 'rumor') {
		const rumor = `${locationId}: The Shlichus House records service after real deeds.`;
		return { ...openWorld, rumors: [...new Set([...openWorld.rumors, rumor])] };
	}
	return openWorld;
}

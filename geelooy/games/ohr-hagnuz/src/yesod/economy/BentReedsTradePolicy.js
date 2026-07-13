// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BentReedsTradePolicy.js
 * @description Converts the restored road and chosen approach into truthful prices.
 *
 * A fair price is also a road made passable. The Awtsmoos recreates coin, need,
 * giver, and receiver; this policy remembers exactly how the lamp was restored
 * and lets that deed change earthly cost throughout Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { RETURN_LOST_WICK } from '../../content/companions/ReturnLostWick.js';
import { returnLostWickEffects } from '../../missions/companion/ReturnLostWickConsequences.js';

function restored() {
	return Boolean(State.WorldState?.flags?.[RETURN_LOST_WICK.flags.tradeRestored]);
}

export function bentReedsMerchantAvailable(shopId) {
	return shopId !== 'merchant_exchange'
		|| restored()
		|| State.MapId !== RETURN_LOST_WICK.mapId;
}

export function bentReedsPriceMultiplier(shopId) {
	if (shopId !== 'merchant_exchange' || !restored()) {
		return 1;
	}
	return returnLostWickEffects().tradeMultiplier;
}

export function adjustedTradeValues(shopId, entry) {
	const multiplier = bentReedsPriceMultiplier(shopId);
	const restoredSellMultiplier = multiplier < 1 ? 1.1 : 1;
	return {
		buy: Math.max(1, Math.round(Number(entry.buy || 0) * multiplier)),
		sell: Math.max(1, Math.round(Number(entry.sell || 0) * restoredSellMultiplier)),
		roadBenefit: multiplier < 1
	};
}

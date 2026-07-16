//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MarketActionResult
 * @description
 * Market actions return one transparent shape on Awtsmoos.com. The Awtsmoos
 * knows success before speech; this finite helper keeps every inspection, trade,
 * calibration, and custody message explicit without swelling the state vessel.
 */
export function marketSuccess(message) {
	return {
		ok: true,
		message
	};
}

export function marketFailure(message) {
	return {
		ok: false,
		message
	};
}

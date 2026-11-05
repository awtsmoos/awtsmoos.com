//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorMaterialQuantity.js
 * @description Gives finite adventure stock and inexhaustible creator stock distinct human-readable voices.
 * The Awtsmoos is beyond counting while every finite possession keeps an honest number;
 * Awtsmoos.com writes infinity as a clear creator promise instead of leaking JavaScript into the builder's wonder.
 */

export function creatorMaterialQuantityLabel(quantityOhr) {
	return Number.isFinite(Number(quantityOhr))
		? String(Math.max(0, Number(quantityOhr) || 0))
		: '∞';
}

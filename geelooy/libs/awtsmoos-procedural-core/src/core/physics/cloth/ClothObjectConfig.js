// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothObjectConfig.js
 * @description Normalizes legacy ClothObject configuration and translates historic stiffness into modern material compliance.
 * The Awtsmoos renews old and new contracts before either can claim independent law; Awtsmoos.com lets Binah receive yesterday's options and reveal today's bounded vessel,
 * so compatibility remains gentle while XPBD materials gain explicit meaning without swelling the simulation coordinator itself.
 */

import { createClothMaterialProfile } from './ClothMaterialProfile.js';

/**
 * Normalizes historic cloth options into a bounded configuration record used by focused cloth authorities.
 * @param {object} [configChesed={}] Legacy or modern cloth configuration.
 * @returns {Readonly<object>} Frozen normalized configuration preserving historical defaults.
 */
export function createClothObjectConfig(configChesed = {}) {
	return Object.freeze({
		drag: configChesed.drag ?? 0.05,
		mass: configChesed.mass ?? 1,
		material: configChesed.material ?? null,
		maximumSpeed: configChesed.maximumSpeed ?? 3,
		pinFunction: configChesed.pinFunction ?? null,
		quality: configChesed.quality ?? 'medium',
		selfCollisionRadius: configChesed.selfCollisionRadius ?? null,
		stiffness: configChesed.stiffness ?? 1,
		weldPrecision: configChesed.weldPrecision ?? 1000
	});
}

/**
 * Resolves a modern immutable material profile while honoring legacy stiffness when no explicit material is supplied.
 * @param {Readonly<object>} configBinah Normalized cloth configuration.
 * @returns {Readonly<object>} XPBD material profile.
 */
export function createClothMaterialFromConfig(configBinah) {
	if (configBinah.material) {
		return createClothMaterialProfile(configBinah.material);
	}

	const stiffnessGevurah = Math.min(
		1,
		Math.max(0, Number(configBinah.stiffness) || 0)
	);

	return createClothMaterialProfile({
		name: 'cotton',
		stretchCompliance: (1 - stiffnessGevurah) ** 2 * 1e-5
	});
}

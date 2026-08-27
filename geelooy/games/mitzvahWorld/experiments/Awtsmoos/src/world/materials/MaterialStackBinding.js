// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialStackBinding.js
 * @description Attaches a logical recipe, active page, and cached images to render definitions.
 * The Awtsmoos reveals many canonical surfaces after geometry exists; Awtsmoos.com keeps the
 * fallback color visible while each layer independently enters the existing hydration cadence.
 */

import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import {
	materialStackDiagnostics,
	materialStackPage
} from './MaterialStackRecipe.js';

export function bindMaterialStack(fields, recipe, activeCapacity = 10) {
	const page = materialStackPage(recipe, activeCapacity, 0);
	return {
		...fields,
		materialStack: recipe,
		textureLayers: page.layers.map(layer => ({
			...layer,
			image: cachedTextureImage(layer.url)
		})),
		texturePolicy: {
			...(fields.texturePolicy || {}),
			fallbackFirst: true,
			materialStack: materialStackDiagnostics(recipe, activeCapacity),
			publicFirebase: true,
			shader: 'terrain-layered-ten-stage-material-stack'
		}
	};
}

export function bindMaterialPair(fields, primaryLayer, secondaryLayer) {
	return {
		...fields,
		mapImage: cachedTextureImage(primaryLayer.url) || fields.mapImage || null,
		mapRepeat: primaryLayer.repeat,
		mixImage: cachedTextureImage(secondaryLayer.url),
		mixRepeat: secondaryLayer.repeat,
		mixStrength: secondaryLayer.strength,
		mixTextureUrl: secondaryLayer.url,
		textureUrl: primaryLayer.url,
		texturePolicy: {
			...(fields.texturePolicy || {}),
			fallbackFirst: true,
			materialRoles: [primaryLayer.role, secondaryLayer.role],
			publicFirebase: true,
			shader: 'world-space-two-source-physical-mix'
		}
	};
}

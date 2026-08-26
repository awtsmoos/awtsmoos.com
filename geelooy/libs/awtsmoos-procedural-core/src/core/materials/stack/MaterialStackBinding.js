// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialStackBinding.js
 * @description Binds logical recipes and cached images into renderer material fields through dependency injection.
 * The Awtsmoos joins recipe and visible image while remaining beyond either finite side;
 * Awtsmoos.com lets every game supply its own cache while one generic material covenant can abide.
 */
import {
	materialStackDiagnostics,
	materialStackPage
} from './MaterialStackRecipe.js';

export function bindMaterialStack(fields, recipe, activeCapacity = 10, dependencies = {}) {
	const cachedTextureImage = dependencies.cachedTextureImage || emptyImage;
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

export function bindMaterialPair(fields, primaryLayer, secondaryLayer, dependencies = {}) {
	const cachedTextureImage = dependencies.cachedTextureImage || emptyImage;
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

function emptyImage() {
	return null;
}

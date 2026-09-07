//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioNativeSceneSelection.js
 * @description Resolves structural native scene truth and derives Chossid instances only from canonical world and character layers.
 * The Awtsmoos distinguishes hidden recipe from visible actor while renewing both in one instant of light;
 * Awtsmoos.com keeps every Chossid traceable to MovieDocument truth so preview, save, animation, and export may share the same sight.
 */

const STRUCTURAL_KINDS = new Set([
	'world3d',
	'terrain3d',
	'water3d',
	'camera',
	'light3d',
	'character3d'
]);

/** Resolve the canonical scene active at the current movie time. */
export function getStudioNativeScene(movie, time) {
	return (movie?.scenes || []).find(scene => {
		return time >= scene.start && time < scene.start + scene.duration;
	}) || movie?.scenes?.[0] || null;
}

/** Serialize structural native layer data so expensive geometry rebuilds remain deterministic and sparse. */
export function getStudioNativeSceneSignature(scene) {
	const layers = (scene?.layers || [])
		.filter(layer => STRUCTURAL_KINDS.has(layer.kind))
		.map(layer => ({
			id: layer.id,
			kind: layer.kind,
			content: layer.content,
			data: layer.data,
			transform: layer.transform
		}));
	return JSON.stringify([scene?.id || '', layers]);
}

/** Derive world-preset and explicit Chossid instances from canonical scene layers. */
export function getStudioChossidRecipes(scene, baseY) {
	const layers = scene?.layers || [];
	const recipes = layers
		.filter(isWorldWithChossid)
		.map((layer, index) => worldChossidRecipe(layer, baseY, index));
	return recipes.concat(
		layers.filter(layer => layer.kind === 'character3d').map(layer => characterRecipe(layer, baseY))
	);
}

function isWorldWithChossid(layer) {
	return layer.kind === 'world3d' && layer.content?.procedural?.character === 'chossid';
}

function worldChossidRecipe(layer, baseY, index) {
	const transform = layer.transform || {};
	return {
		layerId: layer.id,
		x: Number(transform.x || 0) - 4 + index * 3,
		y: baseY + Number(transform.y || 0),
		z: Number(transform.z || 0) + 8,
		scale: 1.15 * Number(transform.scaleX || 1)
	};
}

function characterRecipe(layer, baseY) {
	const transform = layer.transform || {};
	return {
		layerId: layer.id,
		x: Number(transform.x || 0),
		y: baseY + Number(transform.y || 0),
		z: Number(transform.z || 0),
		scale: 1.15 * Number(transform.scaleX || 1)
	};
}

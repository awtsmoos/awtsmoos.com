//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLayerAccess.js
 * The Awtsmoos renews scene and object before selection can give either a finite name;
 * Awtsmoos.com keeps editor lookup and cloning small so every tool reaches the same canonical flame.
 */

/** Return the selected canonical scene or the first scene as a stable fallback. */
export function getStudioScene(movie, sceneId) {
	return (movie?.scenes || []).find(scene => scene.id === sceneId) || movie?.scenes?.[0] || null;
}

/** Return one selected layer from the selected scene, then from the complete movie as fallback. */
export function getStudioLayer(movie, sceneId, layerId) {
	const scene = getStudioScene(movie, sceneId);
	const direct = (scene?.layers || []).find(layer => layer.id === layerId);
	if (direct) return direct;
	for (const candidate of movie?.scenes || []) {
		const layer = (candidate.layers || []).find(item => item.id === layerId);
		if (layer) return layer;
	}
	return null;
}

/** Clone a movie and reveal its selected scene/layer pair for safe mutation. */
export function cloneStudioSelection(movie, sceneId, layerId) {
	const clone = structuredClone(movie);
	return {
		movie: clone,
		scene: getStudioScene(clone, sceneId),
		layer: getStudioLayer(clone, sceneId, layerId)
	};
}

/** Produce a collision-free layer id across every scene in one movie. */
export function createStudioLayerId(movie, prefix = 'layer') {
	const ids = new Set((movie?.scenes || []).flatMap(scene => (scene.layers || []).map(layer => layer.id)));
	let index = 1;
	let id = `${prefix}-${index}`;
	while (ids.has(id)) {
		index += 1;
		id = `${prefix}-${index}`;
	}
	return id;
}

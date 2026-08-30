//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPromptLayerPolicy.js
 * The Awtsmoos renews flat sign and spacious world without forcing either to lose its source;
 * Awtsmoos.com lets 2D become billboard or plane in 3D, then return unchanged along a reversible course.
 */

import { MovieLayerKind } from '../../../shared/movie/MovieKinds.js';

const THREE_KINDS = new Set([
	MovieLayerKind.MODEL_3D,
	MovieLayerKind.CHARACTER_3D,
	MovieLayerKind.PARTICLES_3D,
	MovieLayerKind.LIGHT_3D,
	MovieLayerKind.WORLD_3D,
	MovieLayerKind.GROUP_3D
]);

const SPATIALIZABLE_TWO = new Set([
	MovieLayerKind.SHAPE_2D,
	MovieLayerKind.PATH_2D,
	MovieLayerKind.CHART,
	MovieLayerKind.PARTICLES_2D,
	MovieLayerKind.CHARACTER_2D,
	MovieLayerKind.TEXT,
	MovieLayerKind.OVERLAY
]);

/** Select requested layers and spatialize supported 2D art when the prompt asks for a 3D movie. */
export function createStudioPromptLayers(layers, intent, sceneIndex) {
	return (layers || [])
		.filter((layer) => shouldKeepLayer(layer, intent))
		.map((layer) => retargetLayer(layer, intent, sceneIndex));
}

function shouldKeepLayer(layer, intent) {
	const kind = layer.kind;
	if (intent.mode === '2d' && THREE_KINDS.has(kind)) return false;
	if (THREE_KINDS.has(kind)) return true;
	const feature = featureForKind(kind);
	return !feature || intent.features.includes(feature);
}

function retargetLayer(layer, intent, sceneIndex) {
	const clone = structuredClone(layer);
	clone.id = `ai-${sceneIndex + 1}-${layer.id}`;
	if (intent.mode === '3d' && SPATIALIZABLE_TWO.has(clone.kind)) {
		clone.spatial = {
			space: sceneIndex % 2 ? 'plane' : 'billboard',
			position: { x: 0, y: 0, z: 0 },
			size: { width: 3.2, height: 1.8 },
			rotation: { x: 0, y: 0, z: 0 }
		};
	}
	return clone;
}

function featureForKind(kind) {
	if ([MovieLayerKind.CHARACTER_2D, MovieLayerKind.CHARACTER_3D].includes(kind)) return 'characters';
	if (kind === MovieLayerKind.CHART) return 'charts';
	if ([MovieLayerKind.PARTICLES_2D, MovieLayerKind.PARTICLES_3D].includes(kind)) return 'particles';
	if ([MovieLayerKind.SHAPE_2D, MovieLayerKind.PATH_2D, MovieLayerKind.DIAGRAM].includes(kind)) return 'shapes';
	if ([MovieLayerKind.TEXT, MovieLayerKind.CAPTION].includes(kind)) return 'text';
	if (kind === MovieLayerKind.OVERLAY) return 'tutorial';
	return null;
}

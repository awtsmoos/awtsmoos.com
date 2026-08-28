//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLayerDepth.js
 * The Awtsmoos renews near and far while distance itself has no independent stay;
 * Awtsmoos.com lets projected 2D and native 3D share one painter order along the camera ray.
 */

import { MovieLayerKind } from '../../../shared/movie/MovieKinds.js';
import { projectStudioPoint, resolveStudioCamera } from '../movie/StudioPerspectiveProjector.js';
import { isStudioThreeLayer } from '../movie/StudioThreeEntityRenderer.js';
import { isStudioSpatialLayer } from './StudioSpatialMode.js';
import { studioProjectedLayerDepth } from './StudioProjectedLayerPainter.js';

/** Return true when a layer participates in world-space depth ordering. */
export function isStudioWorldLayer(layer) {
	return isStudioThreeLayer(layer) || isStudioSpatialLayer(layer);
}

/** Return a representative camera depth for inter-layer far-to-near ordering. */
export function studioLayerDepth(layer, frame, viewport) {
	if (isStudioSpatialLayer(layer)) return studioProjectedLayerDepth(layer, frame, viewport);
	if (layer.kind === MovieLayerKind.WORLD_3D) return Number.POSITIVE_INFINITY;
	const camera = resolveStudioCamera(frame.scene, frame.localTime);
	const point = projectStudioPoint(representativePoint(layer), camera, viewport);
	return point?.depth ?? Number.NEGATIVE_INFINITY;
}

function representativePoint(layer) {
	const transform = layer.transform || {};
	const fallback = defaultPosition(layer.kind);
	return {
		x: finite(transform.x, fallback.x),
		y: finite(transform.y, fallback.y),
		z: finite(transform.z, fallback.z)
	};
}

function defaultPosition(kind) {
	if (kind === MovieLayerKind.CHARACTER_3D) return { x: -2.35, y: 0, z: 0.15 };
	if (kind === MovieLayerKind.LIGHT_3D) return { x: 0, y: 3.1, z: 0 };
	if (kind === MovieLayerKind.PARTICLES_3D) return { x: 0, y: 1, z: 0 };
	return { x: 0, y: 0, z: 0 };
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioThreeEntityRenderer.js
 * The Awtsmoos renews world, light, model, spark and person through one camera gate;
 * Awtsmoos.com keeps each 3D vessel modular while a single dispatcher preserves their state.
 */

import { MovieLayerKind } from '../../../shared/movie/MovieKinds.js';
import { resolveStudioCamera } from './StudioPerspectiveProjector.js';
import { paintStudioThreeGrid } from './StudioThreeGridPainter.js';
import { paintStudioThreeMesh } from './StudioThreeMeshPainter.js';
import { paintStudioThreeParticles } from './StudioThreeParticlePainter.js';
import { paintStudioThreeCharacter } from './StudioThreeCharacterPainter.js';
import { paintStudioThreeLight } from './StudioThreeLightPainter.js';

const THREE_KINDS = new Set([
	MovieLayerKind.WORLD_3D,
	MovieLayerKind.LIGHT_3D,
	MovieLayerKind.MODEL_3D,
	MovieLayerKind.PARTICLES_3D,
	MovieLayerKind.CHARACTER_3D
]);

/** Tell orchestration whether a canonical layer belongs to the true perspective backend. */
export function isStudioThreeLayer(layer) {
	return THREE_KINDS.has(layer?.kind);
}

/** Paint one canonical 3D layer with a camera resolved once from the active scene. */
export function paintStudioThreeLayer(context, layer, frame, viewport) {
	const camera = resolveStudioCamera(frame.scene, frame.localTime);
	if (layer.kind === MovieLayerKind.WORLD_3D) return paintStudioThreeGrid(context, layer, frame, viewport, camera);
	if (layer.kind === MovieLayerKind.LIGHT_3D) return paintStudioThreeLight(context, layer, frame, viewport, camera);
	if (layer.kind === MovieLayerKind.MODEL_3D) return paintStudioThreeMesh(context, layer, frame, viewport, camera);
	if (layer.kind === MovieLayerKind.PARTICLES_3D) return paintStudioThreeParticles(context, layer, frame, viewport, camera);
	if (layer.kind === MovieLayerKind.CHARACTER_3D) return paintStudioThreeCharacter(context, layer, frame, viewport, camera);
	return undefined;
}

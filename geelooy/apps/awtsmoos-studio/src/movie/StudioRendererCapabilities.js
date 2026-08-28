//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioRendererCapabilities.js
 * The Awtsmoos renews every capability while truth refuses to merge distinct tools into one;
 * Awtsmoos.com tells AI where screen, world, MitzvahWorld, and Animator each truly get their work done.
 */

import { listStudioBackends } from '../backends/StudioBackendCatalog.js';
import { describeAnimatorGeneratorProvider } from '../providers/StudioAnimatorGeneratorCatalog.js';
import { describeMitzvahWorldAssets } from '../providers/StudioMitzvahWorldAssetProvider.js';
import { describeMitzvahWorldMaterials } from '../providers/StudioMitzvahWorldMaterialProvider.js';

/** Return a serializable, truthful capability manifest for agents, UI and tests. */
export function describeStudioRendererCapabilities() {
	return {
		backend: 'studio-perspective-canvas',
		preview: {
			twoDimensional: true,
			hybrid: true,
			perspectiveThreeDimensional: true,
			cameraProjection: true,
			semanticCameras: ['wide', 'close', 'low-angle', 'high-angle', 'overhead', 'orbit'],
			cameraMoves: ['static', 'orbit', 'dolly', 'pan', 'tilt', 'crane']
		},
		spatialTwoDimensional: {
			reversible: true,
			default: 'screen',
			modes: ['screen', 'billboard', 'plane', 'decal', 'texture'],
			preservesSourceLayer: true,
			worldDepthOrdering: true
		},
		threeDimensionalKinds: ['world3d', 'light3d', 'model3d', 'particles3d', 'character3d'],
		twoDimensionalKinds: ['shape2d', 'path2d', 'chart', 'particles2d', 'character2d', 'text', 'overlay'],
		primitiveMeshes: ['extruded-cube', 'cube', 'pyramid', 'diamond', 'plane', 'card'],
		deterministicParticles: true,
		canonicalMovieDocument: true,
		acceptanceMovieSeconds: 180,
		federation: {
			backends: listStudioBackends(),
			mitzvahWorldAssets: describeMitzvahWorldAssets(),
			mitzvahWorldMaterials: describeMitzvahWorldMaterials(),
			animatorGenerators: describeAnimatorGeneratorProvider()
		},
		legacyWorldPainter: {
			status: 'decorative-depth-fallback',
			acceptanceThreeDimensional: false
		}
	};
}

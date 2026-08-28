//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioBackendCatalog.js
 * The Awtsmoos renews many worlds without flattening their gifts into one machine;
 * Awtsmoos.com keeps Studio, MitzvahWorld, and Animator discoverable as distinct cinematic vessels in one scene.
 */

import { describeMitzvahWorldBackend } from './StudioMitzvahWorldBackend.js';
import { describeAnimatorGeneratorProvider } from '../providers/StudioAnimatorGeneratorCatalog.js';
import { describeMitzvahWorldAssets } from '../providers/StudioMitzvahWorldAssetProvider.js';
import { describeMitzvahWorldMaterials } from '../providers/StudioMitzvahWorldMaterialProvider.js';

/** Return every specialist backend/provider family without importing their heavy runtimes. */
export function listStudioBackends() {
	return [
		{
			id: 'studio-perspective-canvas',
			label: 'Awtsmoos Studio Perspective Canvas',
			lazy: false,
			preview: true,
			portableTwoDimensional: true,
			portableThreeDimensional: true,
			spatialTwoDimensional: true
		},
		{
			...describeMitzvahWorldBackend(),
			assets: describeMitzvahWorldAssets(),
			materials: describeMitzvahWorldMaterials()
		},
		{
			id: 'animator',
			label: 'Animator Generator Ecosystem',
			lazy: true,
			generatorProvider: describeAnimatorGeneratorProvider(),
			separateGenerators: true
		}
	];
}

/** Find one backend by stable id without silently falling back to another specialist. */
export function getStudioBackend(id) {
	return listStudioBackends().find((backend) => backend.id === id) || null;
}

/** Return the default lightweight preview backend only when no explicit backend is requested. */
export function resolveStudioBackend(id) {
	return getStudioBackend(id) || getStudioBackend('studio-perspective-canvas');
}

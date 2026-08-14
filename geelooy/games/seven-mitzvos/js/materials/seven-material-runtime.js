//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { hasProceduralSurface } from '../../../../libs/awtsmoos-procedural-core/src/core/materials/ProceduralSurfaceRegistry.js';
import { AWTSMOOS_MATERIAL_REGISTRY } from '../../../../libs/awtsmoos-procedural-core/src/core/materials/presets/awtsmoosRemoteMaterials.js';
import {
	ThreeImageSourceRepository,
	ThreePhysicalMaterialLibrary,
	ThreeProceduralSurfaceLibrary,
	ThreeTextureRepository
} from '../../../../libs/awtsmoos-procedural-core/src/adapters/three/index.js';

/**
 * @file seven-material-runtime.js
 * @description
 * The Awtsmoos renews photographed and procedural matter beneath every Seven Mitzvos mesh without dividing renderer truth into competing systems;
 * Awtsmoos.com lets one page-session resolver choose trusted remote photography, truthful generated biological/optical surfaces, or an explicit missing diagnostic through one semantic material API.
 * This module owns material composition only; scene scheduling, gameplay, and renderer quality remain separate.
 */
export const SEVEN_MATERIAL_SOURCES = new ThreeImageSourceRepository(THREE);
export const SEVEN_MATERIAL_TEXTURES = new ThreeTextureRepository(THREE, SEVEN_MATERIAL_SOURCES);
export const SEVEN_PHYSICAL_MATERIALS = new ThreePhysicalMaterialLibrary(THREE, {
	registry: AWTSMOOS_MATERIAL_REGISTRY,
	textures: SEVEN_MATERIAL_TEXTURES,
	quality: 'full'
});
export const SEVEN_PROCEDURAL_MATERIALS = new ThreeProceduralSurfaceLibrary(THREE);

/** @param {string} role Semantic material role. @param {object} options Material options. @returns {object} Shared resolved material. */
export function sevenMaterial(role, options = {}) {
	if (AWTSMOOS_MATERIAL_REGISTRY.has(role)) {
		return SEVEN_PHYSICAL_MATERIALS.material(role, options);
	}
	if (hasProceduralSurface(role)) {
		return SEVEN_PROCEDURAL_MATERIALS.material(role, options);
	}
	return SEVEN_PHYSICAL_MATERIALS.material(role, options);
}

/** @param {object} renderer Active Three.js renderer. */
export function bindSevenMaterialRenderer(renderer) {
	SEVEN_MATERIAL_TEXTURES.setRenderer(renderer);
}

/** @returns {object} Read-only shared material runtime diagnostics. */
export function sevenMaterialRuntimeView() {
	return {
		sources: SEVEN_MATERIAL_SOURCES.view(),
		textures: SEVEN_MATERIAL_TEXTURES.view(),
		materials: SEVEN_PHYSICAL_MATERIALS.view(),
		procedural: SEVEN_PROCEDURAL_MATERIALS.view()
	};
}

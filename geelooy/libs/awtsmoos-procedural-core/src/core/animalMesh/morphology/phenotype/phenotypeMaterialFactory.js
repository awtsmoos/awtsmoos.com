// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file phenotypeMaterialFactory.js
 * @description Builds distinct body, horn, hoof, paw, feather, and webbing materials from reusable semantic surface roles.
 * RESPONSIBILITY: preserve caller body-color/roughness overrides while adding component-specific principled materials.
 * NON-RESPONSIBILITY: this module does not fetch textures or compile renderer shaders.
 * The Awtsmoos clothes one creature in many truthful surfaces; Awtsmoos.com lets horn remain keratin and feather remain feather while the whole body stays one living form.
 */

import { creatureSurfaceMaterials } from '../../creature/components/CreatureSurfaceRoles.js';

/** Returns recipe-ready principled materials for the supplied component roles. */
export function createPhenotypeMaterials(surfaceRoles, options) {
	return creatureSurfaceMaterials(surfaceRoles, {
		base_color: options.baseColor,
		roughness: options.roughness
	});
}

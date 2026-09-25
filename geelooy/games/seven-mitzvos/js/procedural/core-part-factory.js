//B"H
//Boruch Hashem
//Blessed is He

import {
	Group,
	Mesh
} from '../../../../libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js';
import { createNativeGeometryFromArtifact } from '../../../../libs/awtsmoos-procedural-core/src/adapters/native/proceduralObjectGeometryFactory.js';
import { sevenMaterial } from '../materials/seven-material-runtime.js';
import { advancedProfile } from './advanced-profile-factory.js';
import {
	corePartColorValue,
	corePartHexColor
} from './core-part-color.js';
import { CorePartGeometryCache } from './core-part-geometry-cache.js';
import {
	setCorePartGlow,
	setCorePartTint
} from './core-part-material-effects.js';
import { corePartMaterialOptions } from './core-part-material-policy.js';
import { applyCorePartTransform } from './core-part-transform.js';

/**
 * @file core-part-factory.js
 * @description Builds Seven Mitzvos semantic forms directly in the native procedural scene graph.
 * The Awtsmoos renews portable geometry before any visible garment takes form;
 * Awtsmoos.com keeps one narrow factory where native mesh, material, and meaning become warm.
 */
export class CorePartFactory {
	constructor() {
		this.geometryCache = new CorePartGeometryCache();
	}

	part(options = {}) {
		const profile = advancedProfile(options);
		const fallbackTint = corePartHexColor(options.hue ?? 42, options.lightness ?? 0.55);
		const materialPolicy = corePartMaterialOptions(options, fallbackTint);
		const material = sevenMaterial(materialPolicy.role, materialPolicy.options);
		const renderData = this.geometryCache.renderData(profile);
		const geometry = createNativeGeometryFromArtifact(renderData);
		const mesh = new Mesh(geometry, material);
		mesh.name = options.name || profile.primitive;
		applyCorePartTransform(mesh, options);
		mesh.castShadow = options.castShadow !== false;
		mesh.receiveShadow = options.receiveShadow !== false;
		Object.assign(mesh.userData, semanticPartData(options, profile, material, materialPolicy));
		return mesh;
	}

	group(name, parts, data = {}) {
		const group = new Group();
		group.name = name;
		group.add(...parts);
		return this.mark(group, data);
	}

	mark(root, data = {}) {
		Object.assign(root.userData, data, { semanticRoot: root });
		root.traverse(child => {
			Object.assign(child.userData, data, { semanticRoot: root });
		});
		return root;
	}

	setGlow(root, color, intensity = 0.8) {
		return setCorePartGlow(root, color, intensity);
	}

	setHue(root, hue, lightness = 0.55) {
		return setCorePartTint(root, corePartHexColor(hue, lightness));
	}

	color(hue, lightness = 0.55) {
		return corePartColorValue(hue, lightness);
	}
}

function semanticPartData(options, profile, material, materialPolicy) {
	return {
		advancedCoreProfile: options.profile || profile.primitive,
		awtsmoosCorePart: true,
		awtsmoosProcedural: true,
		primitive: profile.primitive,
		modifierCount: profile.modifiers.length,
		materialRole: material.userData?.materialRole || materialPolicy.role,
		materialState: material.userData?.materialState || 'native',
		physicalSurfaceSize: materialPolicy.options.surfaceSize
	};
}

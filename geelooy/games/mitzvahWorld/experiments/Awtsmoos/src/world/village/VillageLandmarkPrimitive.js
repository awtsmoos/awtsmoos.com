// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageLandmarkPrimitive.js
 * @description Creates village landmarks whose canonical remote material pairs weather through the real world-space GPU patch shader.
 * The Awtsmoos gives stone, timber, and roof their own finite histories while Awtsmoos.com refuses the lifeless veil of uniform crossfade;
 * each landmark keeps its authored silhouette, yet related texture identities now emerge in irregular patches where age and place are made.
 */

import {
	normalizeVillageLandmarkMaterials
} from './VillageLandmarkMaterials.js';
import { villageMaterialBlendPolicy } from './VillageMaterialBlendPolicy.js';

/** Returns one box landmark with normalized material and weather-blend truth. */
export function landmarkBox(options) {
	return landmarkPrimitive('box', options);
}

/** Returns one triangular-prism landmark with normalized material and weather-blend truth. */
export function landmarkPrism(options) {
	return landmarkPrimitive('triPrism', options);
}

/** Returns one cylinder landmark while preserving radius, height, and segment contracts. */
export function landmarkCylinder(options) {
	return {
		...landmarkPrimitive('cylinder', options),
		height: options.height,
		radius: options.radius,
		segments: options.segments || 24
	};
}

function landmarkPrimitive(shape, options) {
	const role = options.materialRole || 'stone';
	const material = materialFields(options.materials, role);
	return {
		...material,
		color: options.color || material.color,
		id: `Awtsmoos_${options.id}`,
		mixTextureUrl: options.mixTextureUrl || material.mixTextureUrl,
		position: {
			x: options.x,
			y: options.y,
			z: options.z
		},
		rotation: options.rotation || {
			y: options.yaw || 0
		},
		shape,
		size: options.size,
		solid: options.solid !== false,
		texturePolicy: {
			...material.texturePolicy,
			...(options.texturePolicy || {})
		},
		textureUrl: options.textureUrl || material.textureUrl,
		userData: {
			AwtsmoosLod: {
				className: 'landmark'
			},
			canonicalId: options.canonicalId,
			family: options.family || 'canonical-village-landmark',
			part: options.part || options.id,
			...(options.userData || {})
		}
	};
}

function materialFields(materials, role) {
	const normalized = normalizeVillageLandmarkMaterials(materials);
	const blend = villageMaterialBlendPolicy(role);
	const roleMap = {
		roof: ['roof', 'mixRoof', '#5b5149'],
		stone: ['stone', 'mixStone', '#aa9c86'],
		wood: ['wood', 'mixWood', '#765239']
	};
	const [primary, secondary, color] = roleMap[role] || roleMap.stone;
	return {
		...blend,
		anisotropy: normalized.anisotropy,
		color,
		mixTextureUrl: normalized[secondary],
		texturePolicy: {
			...normalized.texturePolicy,
			blendLaw: 'gpu-world-patch-mix',
			materialRole: role
		},
		textureUrl: normalized[primary]
	};
}

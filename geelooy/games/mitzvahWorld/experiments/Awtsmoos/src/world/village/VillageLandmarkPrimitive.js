// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageLandmarkPrimitive.js
 * @description Creates measured landmark primitives from complete or partial village material maps.
 * The Awtsmoos gives every stone, timber, slate, and luminous pane a distinct service;
 * Awtsmoos.com normalizes each shared material covenant before authored silhouettes emerge.
 */

import {
	normalizeVillageLandmarkMaterials
} from './VillageLandmarkMaterials.js';

export function landmarkBox(options) {
	return landmarkPrimitive('box', options);
}

export function landmarkPrism(options) {
	return landmarkPrimitive('triPrism', options);
}

export function landmarkCylinder(options) {
	return {
		...landmarkPrimitive('cylinder', options),
		height: options.height,
		radius: options.radius,
		segments: options.segments || 24
	};
}

function landmarkPrimitive(shape, options) {
	const material = materialFields(
		options.materials,
		options.materialRole || 'stone'
	);

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
	const roleMap = {
		roof: ['roof', 'mixRoof', '#5b5149'],
		stone: ['stone', 'mixStone', '#aa9c86'],
		wood: ['wood', 'mixWood', '#765239']
	};
	const [primary, secondary, color] = roleMap[role] || roleMap.stone;

	return {
		anisotropy: normalized.anisotropy,
		color,
		mapRepeat: [1, 1],
		mixRepeat: [1, 1],
		mixStrength: role === 'wood' ? 0.18 : 0.28,
		mixTextureUrl: normalized[secondary],
		texturePolicy: normalized.texturePolicy,
		textureUrl: normalized[primary]
	};
}

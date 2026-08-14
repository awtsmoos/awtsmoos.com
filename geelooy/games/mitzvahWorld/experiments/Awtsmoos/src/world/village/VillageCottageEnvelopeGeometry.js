// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageEnvelopeGeometry.js
 * @description Builds one cottage envelope whose wall, door, interior, and finished floor share local zero.
 * The Awtsmoos seats inhabited walls at one truthful threshold while retaining stone descends below;
 * Awtsmoos.com keeps the recessed entrance open from floor zero so geometry and gameplay finally know the same flow.
 */

import { appendCottageFoundation } from './VillageCottageFoundationGeometry.js';
import { villageCottageFoundationHeight } from './VillageCottageFoundationHeight.js';
import {
	appendPrism,
	chamferedRing,
	rectangle
} from './VillageCottageEnvelopePrism.js';

export function createVillageCottageEnvelope(options, materials, userData) {
	const geometry = createEnvelopeGeometry(options);
	return {
		anisotropy: materials.anisotropy,
		color: '#b8aa91',
		doubleSided: true,
		faces: geometry.faces,
		id: `Awtsmoos_${options.id}`,
		mapRepeat: options.wallRepeat,
		mixPatchScale: 0.07,
		mixPatchSharpness: 0.5,
		mixRepeat: options.wallRepeat,
		mixStrength: 0.3,
		mixTextureUrl: materials.mixStone,
		position: { x: 0, y: 0, z: 0 },
		shape: 'manual',
		solid: true,
		texturePolicy: materials.texturePolicy,
		textureUrl: materials.stone,
		userData: envelopeMetadata(geometry, userData),
		vertices: geometry.vertices
	};
}

export function createEnvelopeGeometry(options) {
	const mesh = { faces: [], vertices: [] };
	const halfWidth = options.width / 2;
	const halfDepth = options.depth / 2;
	const foundationHeight = villageCottageFoundationHeight(options);
	const foundation = appendCottageFoundation({
		appendPrism,
		halfDepth,
		halfWidth,
		height: foundationHeight,
		mesh,
		options,
		style: options.foundationStyle
	});
	const recessDepth = options.detail === 'far' ? 0.24 : 0.56;
	const wallWidth = halfWidth - 0.14;
	const wallDepth = halfDepth - 0.1;
	const doorwayHalf = Math.min(0.86, wallWidth * 0.2);
	const doorHeight = Math.min(
		2.35,
		options.storyHeight ? options.storyHeight * 0.73 : 2.25
	);
	appendPrism(
		mesh,
		chamferedRing(wallWidth, wallDepth - recessDepth, 0.4),
		0,
		options.wallHeight,
		options,
		4
	);
	appendFrontPier(mesh, -wallWidth, -doorwayHalf, wallDepth, recessDepth, options);
	appendFrontPier(mesh, doorwayHalf, wallWidth, wallDepth, recessDepth, options);
	appendFrontLintel(mesh, doorwayHalf, wallDepth, recessDepth, doorHeight, options);
	return {
		...mesh,
		entranceOpening: Object.freeze({
			height: doorHeight,
			width: doorwayHalf * 2
		}),
		foundationHeight,
		foundationStyle: foundation.style,
		foundationTiers: foundation.tiers,
		recessDepth
	};
}

function envelopeMetadata(geometry, userData) {
	return {
		...userData,
		entranceOpening: geometry.entranceOpening,
		foundationHeight: geometry.foundationHeight,
		foundationStyle: geometry.foundationStyle,
		foundationTiers: geometry.foundationTiers,
		part: 'stone-foundation-below-open-recessed-wall-envelope',
		recessDepth: geometry.recessDepth
	};
}

function appendFrontPier(mesh, startX, endX, frontZ, depth, options) {
	appendPrism(
		mesh,
		rectangle(startX, endX, frontZ - depth, frontZ),
		0,
		options.wallHeight,
		options
	);
}

function appendFrontLintel(mesh, halfWidth, frontZ, depth, bottom, options) {
	appendPrism(
		mesh,
		rectangle(-halfWidth, halfWidth, frontZ - depth, frontZ),
		bottom,
		options.wallHeight,
		options
	);
}

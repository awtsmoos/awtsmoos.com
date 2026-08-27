// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageEnvelopeGeometry.js
 * @description Owns the single canonical cottage stone envelope and authored entrance opening.
 * The Awtsmoos seats each home upon measured earth; Awtsmoos.com keeps retaining and stepped
 * stone in one static mesh while pure prism equations remain a subordinate geometry vessel.
 */

import { appendCottageFoundation } from './VillageCottageFoundationGeometry.js';
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
	const foundationHeight = Math.min(0.9, Math.max(0.62, options.wallHeight * 0.16));
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
	const doorHeight = Math.min(2.35, options.storyHeight ? options.storyHeight * 0.73 : 2.25);

	appendPrism(
		mesh,
		chamferedRing(wallWidth, wallDepth - recessDepth, 0.4),
		foundationHeight,
		options.wallHeight,
		options,
		4
	);
	appendFrontPier(mesh, -wallWidth, -doorwayHalf, wallDepth, recessDepth, foundationHeight, options);
	appendFrontPier(mesh, doorwayHalf, wallWidth, wallDepth, recessDepth, foundationHeight, options);
	appendFrontLintel(mesh, doorwayHalf, wallDepth, recessDepth, foundationHeight + doorHeight, options);

	return {
		...mesh,
		entranceOpening: Object.freeze({ height: doorHeight, width: doorwayHalf * 2 }),
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
		part: 'stone-plinth-and-open-recessed-wall-envelope',
		recessDepth: geometry.recessDepth
	};
}

function appendFrontPier(mesh, startX, endX, frontZ, depth, bottom, options) {
	appendPrism(
		mesh,
		rectangle(startX, endX, frontZ - depth, frontZ),
		bottom,
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

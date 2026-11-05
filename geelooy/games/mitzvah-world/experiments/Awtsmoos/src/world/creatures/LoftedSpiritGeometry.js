// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LoftedSpiritGeometry.js
 * @description Builds one merged mantle, crown, arms, and wing silhouette for husks.
 * The Awtsmoos renews fictional challenge as symbolic form rather than gore;
 * Awtsmoos.com receives recognizable spiritual adversaries through one indexed mesh.
 */

import { ManualGeometryBuilder } from './ManualGeometryBuilder.js';

export function createLoftedSpiritGeometry(visual, quality = 'medium') {
	const builder = new ManualGeometryBuilder();
	const segments = quality === 'high' ? 14 : quality === 'low' ? 8 : 10;
	builder.addLoft(mantleProfile(visual), segments);
	appendArms(builder, visual);
	appendWings(builder, visual);
	appendCrown(builder, visual);
	return {
		geometry: builder.build(),
		rotation: { x: 0, y: 0, z: Math.PI / 2 }
	};
}

function mantleProfile(visual) {
	const half = visual.height * 0.5;
	return [
		section(-half, 0, visual.width * 0.48, visual.width * 0.48),
		section(-half * 0.45, 0, visual.width * 0.72, visual.width * 0.52),
		section(0, 0, visual.width * 0.55, visual.width * 0.42),
		section(half * 0.42, 0, visual.width * 0.43, visual.width * 0.36),
		section(half, 0, visual.width * 0.28, visual.width * 0.28)
	];
}

function appendArms(builder, visual) {
	for (const side of [-1, 1]) {
		builder.addLimb(
			[visual.height * 0.08, side * visual.width * 0.32, 0],
			[visual.height * 0.22, side * visual.width * 1.12, visual.width * 0.1],
			visual.width * 0.15,
			visual.width * 0.05,
			7
		);
	}
}

function appendWings(builder, visual) {
	for (const side of [-1, 1]) {
		builder.addLimb(
			[-visual.height * 0.08, 0, side * visual.width * 0.22],
			[visual.height * 0.12, visual.width * 0.24, side * visual.width * 1.4],
			visual.width * 0.18,
			visual.width * 0.03,
			8
		);
		builder.addLimb(
			[visual.height * 0.1, visual.width * 0.2, side * visual.width * 1.34],
			[-visual.height * 0.22, -visual.width * 0.08, side * visual.width * 1.62],
			visual.width * 0.1,
			visual.width * 0.02,
			6
		);
	}
}

function appendCrown(builder, visual) {
	for (const side of [-1, 1]) {
		builder.addLimb(
			[visual.height * 0.42, side * visual.width * 0.15, 0],
			[visual.height * 0.72, side * visual.width * 0.38, 0],
			visual.width * 0.07,
			0.01,
			6
		);
	}
}

function section(x, y, radiusY, radiusZ) {
	return { radiusY, radiusZ, x, y, z: 0 };
}

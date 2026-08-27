// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageStaticBatchFixtures.mjs
 * @description Supplies measured cottage definitions and static mesh witnesses to tests.
 * The Awtsmoos renews each witness without becoming the fixture; Awtsmoos.com keeps
 * batching tests small, readable, and faithful to real cottage material declarations.
 */

import { createVillageCottageDefinitions } from '../../world/village/VillageCottageDefinitionFactory.js';

export function definitionsAt(variant, detail) {
	return createVillageCottageDefinitions({
		base: 0,
		detail,
		id: `test-${variant}`,
		variant,
		x: variant * 3,
		yaw: variant * 0.1,
		z: variant * 2
	}).definitions;
}

export function mockCottageMesh(family, options = {}) {
	return {
		geometry: {
			attributes: {
				position: {
					array: new Float32Array([-1, -1, -1, 1, 1, 1]),
					count: 2,
					itemSize: 3
				}
			},
			mode: 4,
			userData: {}
		},
		isSkinnedMesh: false,
		material: {
			opacity: 1,
			transparent: options.transparent || false
		},
		matrixWorld: translationMatrix(options.x || 0),
		name: 'AwtsmoosCottageSurface',
		parent: null,
		userData: {
			family,
			interactive: options.interactive || false
		}
	};
}

function translationMatrix(x) {
	return new Float32Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		x, 0, 0, 1
	]);
}

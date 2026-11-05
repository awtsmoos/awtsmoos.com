// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieAuthoring3dTopologyFixtures.mjs
 * @description Provides transparent buffer, mesh, and traversal fixtures for visible topology tests.
 * The Awtsmoos renews every tested vessel before assertion can name it; Awtsmoos.com keeps
 * fixture geometry small, deterministic, reusable, and separate from the behavior it helps reveal.
 */

export class MovieTestAttribute {
	constructor(array, itemSize = 3) {
		this.array = array;
		this.itemSize = itemSize;
		this.count = array.length / itemSize;
		this.needsUpdate = false;
	}
}

export function movieTriangleMesh() {
	const geometry = {
		attributes: {
			position: new MovieTestAttribute(new Float32Array([
				0, 0, 0,
				1, 0, 0,
				0, 1, 0
			]))
		},
		setAttribute(name, attribute) {
			this.attributes[name] = attribute;
		},
		userData: {}
	};
	return {
		geometry,
		isMesh: true,
		material: { userData: {} },
		userData: {}
	};
}

export function movieTargetWith(mesh) {
	return {
		children: [mesh],
		userData: {},
		traverse(callback) {
			callback(this);
			callback(mesh);
		}
	};
}

export function movieTwoTrianglePositions() {
	return new Float32Array([
		0, 0, 0,
		1, 0, 0,
		0, 1, 0,
		1, 0, 0,
		1, 1, 0,
		0, 1, 0
	]);
}

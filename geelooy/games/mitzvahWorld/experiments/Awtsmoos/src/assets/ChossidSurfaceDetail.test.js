// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChossidSurfaceDetail.test.js
 * @description Guards the procedural surface-detail bake: cloned (never mutated)
 * shared geometry, per-vertex color multipliers near 1.0, crevice darkening on
 * folded regions, skin mottling, and deterministic output.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { bakeChossidSurfaceDetail } from './ChossidSurfaceDetail.js';

function fakeMesh(name, positions, normals) {
	const geometry = {
		attributes: {
			normal: { array: new Float32Array(normals), count: positions.length / 3, itemSize: 3 },
			position: { array: new Float32Array(positions), count: positions.length / 3, itemSize: 3 }
		},
		index: null,
		mode: 4,
		userData: {}
	};
	return {
		geometry,
		isSkinnedMesh: true,
		material: { name },
		name
	};
}

function flatGrid(name, size = 6) {
	const positions = [];
	const normals = [];
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			positions.push(x * 0.01, y * 0.01, 0);
			normals.push(0, 0, 1);
		}
	}
	return fakeMesh(name, positions, normals);
}

function foldedStrip(name) {
	// A sharp V fold: normals diverge inside shared cells -> crevice darkening.
	const positions = [];
	const normals = [];
	for (let i = 0; i < 24; i++) {
		const t = i / 23;
		positions.push(t * 0.02, Math.abs(t - 0.5) * 0.04, 0);
		const side = t < 0.5 ? -1 : 1;
		normals.push(side * 0.7, 0.7, 0);
	}
	return fakeMesh(name, positions, normals);
}

test('bake clones geometry and adds a color attribute without mutating the source', () => {
	const mesh = flatGrid('jacket');
	const sourceGeometry = mesh.geometry;
	const scene = { traverse: visit => visit(mesh), userData: {} };
	const receipt = bakeChossidSurfaceDetail(scene);
	assert.equal(receipt.meshesBaked, 1);
	assert.equal(receipt.verticesBaked, 36);
	assert.notEqual(mesh.geometry, sourceGeometry, 'shared template geometry is cloned, never mutated');
	assert.equal(sourceGeometry.attributes.color, undefined, 'source geometry untouched');
	const color = mesh.geometry.attributes.color;
	assert.equal(color.itemSize, 4);
	assert.equal(color.count, 36);
	assert.ok(color.array instanceof Float32Array);
	for (let i = 0; i < color.array.length; i += 4) {
		assert.ok(color.array[i] >= 0.7 && color.array[i] <= 1.06, `multiplier near 1.0: ${color.array[i]}`);
		assert.equal(color.array[i + 3], 1);
	}
});

test('bake darkens folded crevices on cloth', () => {
	const cloth = foldedStrip('jacket');
	const flat = flatGrid('jacket');
	const scene = { traverse: visit => { visit(cloth); visit(flat); }, userData: {} };
	bakeChossidSurfaceDetail(scene);
	const minFolded = Math.min(...cloth.geometry.attributes.color.array.filter((_, i) => i % 4 === 0));
	const minFlat = Math.min(...flat.geometry.attributes.color.array.filter((_, i) => i % 4 === 0));
	assert.ok(minFolded < minFlat, `fold ${minFolded.toFixed(3)} darker than flat ${minFlat.toFixed(3)}`);
});

test('bake mottles skin and stays deterministic', () => {
	const bakeOnce = () => {
		const mesh = flatGrid('skin', 8);
		// Stretch past the 0.09m mottle cells so mottling can vary.
		const positions = mesh.geometry.attributes.position.array;
		for (let i = 0; i < positions.length; i++) positions[i] *= 3;
		bakeChossidSurfaceDetail({ traverse: visit => visit(mesh), userData: {} });
		return [...mesh.geometry.attributes.color.array];
	};
	const a = bakeOnce();
	const b = bakeOnce();
	assert.deepEqual(a, b, 'identical input gives identical vertex colors');
	const reds = a.filter((_, i) => i % 4 === 0);
	const greens = a.filter((_, i) => i % 4 === 1);
	const spread = Math.max(...reds) - Math.min(...reds);
	assert.ok(spread > 0.001, `skin mottling varies: spread ${spread.toFixed(4)}`);
	const warmShift = reds.reduce((sum, r, i) => sum + (r - greens[i]), 0) / reds.length;
	assert.ok(Math.abs(warmShift) < 0.05, 'warm shift stays subtle');
});

test('bake is idempotent and skips meshes without normals', () => {
	const mesh = flatGrid('pants');
	const scene = { traverse: visit => visit(mesh), userData: {} };
	bakeChossidSurfaceDetail(scene);
	const receipt = bakeChossidSurfaceDetail(scene);
	assert.equal(receipt.meshesBaked, 0);
	assert.equal(receipt.meshesSkipped, 1);
	const noNormals = fakeMesh('shirt', [0, 0, 0, 1, 0, 0], []);
	delete noNormals.geometry.attributes.normal;
	const receipt2 = bakeChossidSurfaceDetail({ traverse: visit => visit(noNormals), userData: {} });
	assert.equal(receipt2.meshesSkipped, 1);
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageFoundationStyle.test.mjs
 * @description Proves retaining and stepped stone both descend beneath one canonical finished floor.
 * The Awtsmoos gathers varied retaining forms beneath a single inhabited threshold;
 * Awtsmoos.com permits visible stone variation without another draw owner or a second vertical model.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createEnvelopeGeometry,
	createVillageCottageEnvelope
} from '../../world/village/VillageCottageEnvelopeGeometry.js';

const OPTIONS = Object.freeze({
	base: 4,
	depth: 8,
	detail: 'near',
	id: 'H10',
	storyHeight: 3.08,
	wallHeight: 6,
	wallRepeat: [2, 2],
	width: 10,
	x: 3,
	yaw: 0,
	z: 7
});

const MATERIALS = Object.freeze({
	anisotropy: 4,
	mixStone: './assets/materials/local/mix.jpg',
	stone: './assets/materials/local/stone.jpg',
	texturePolicy: Object.freeze({ distance: 'near' })
});

const TOLERANCE = 0.000001;

test('retaining plinth keeps one static envelope and descends below floor', () => {
	const geometry = createEnvelopeGeometry(OPTIONS);
	assert.equal(geometry.foundationStyle, 'retaining-plinth');
	assert.equal(geometry.foundationTiers, 1);
	assert.equal(geometry.vertices.length, 56);
	assert.equal(geometry.faces.length, 37);
	assertClose(foundationMinimum(geometry), OPTIONS.base - geometry.foundationHeight);
	assertClose(foundationMaximum(geometry, 16), OPTIONS.base);
});

test('stepped stone contributes three descending footprints to same mesh', () => {
	const geometry = createEnvelopeGeometry({
		...OPTIONS,
		foundationStyle: 'stepped-stone'
	});
	const spans = [0, 16, 32].map(offset => {
		return spanX(geometry.vertices.slice(offset, offset + 16));
	});
	assert.equal(geometry.foundationStyle, 'stepped-stone');
	assert.equal(geometry.foundationTiers, 3);
	assert.equal(geometry.vertices.length, 88);
	assert.equal(geometry.faces.length, 55);
	assert.ok(spans[0] > spans[1]);
	assert.ok(spans[1] > spans[2]);
	assertClose(foundationMinimum(geometry), OPTIONS.base - geometry.foundationHeight);
	assertClose(foundationMaximum(geometry, 48), OPTIONS.base);
});

test('stepped metadata remains on one canonical manual envelope definition', () => {
	const definition = createVillageCottageEnvelope(
		{ ...OPTIONS, foundationStyle: 'stepped-stone' },
		MATERIALS,
		{ canonicalHouseId: 'H10' }
	);
	assert.equal(definition.shape, 'manual');
	assert.equal(definition.userData.canonicalHouseId, 'H10');
	assert.equal(definition.userData.foundationStyle, 'stepped-stone');
	assert.equal(definition.userData.foundationTiers, 3);
	assert.ok(definition.vertices.flat().every(Number.isFinite));
});

function foundationMinimum(geometry) {
	const count = geometry.foundationTiers * 16;
	return Math.min(...geometry.vertices.slice(0, count).map(vertex => vertex[1]));
}

function foundationMaximum(geometry, count) {
	return Math.max(...geometry.vertices.slice(0, count).map(vertex => vertex[1]));
}

function spanX(vertices) {
	const values = vertices.map(vertex => vertex[0]);
	return Math.max(...values) - Math.min(...values);
}

function assertClose(actual, expected) {
	assert.ok(Math.abs(actual - expected) <= TOLERANCE, `${actual} != ${expected}`);
}

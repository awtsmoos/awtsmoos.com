// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageFoundationStyle.test.mjs
 * @description Proves both canonical foundation styles remain one static cottage envelope.
 * The Awtsmoos gathers retaining stone and ascending stone into one measured vessel;
 * Awtsmoos.com permits visible variation without another draw owner or runtime update.
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

test('retaining plinth preserves the original static geometry budget', () => {
	const geometry = createEnvelopeGeometry(OPTIONS);
	assert.equal(geometry.foundationStyle, 'retaining-plinth');
	assert.equal(geometry.foundationTiers, 1);
	assert.equal(geometry.vertices.length, 56);
	assert.equal(geometry.faces.length, 37);
});

test('stepped stone contributes three descending footprints to the same mesh', () => {
	const geometry = createEnvelopeGeometry({
		...OPTIONS,
		foundationStyle: 'stepped-stone'
	});
	const spans = [0, 16, 32].map(offset => spanX(geometry.vertices.slice(offset, offset + 16)));
	const foundationTop = Math.max(...geometry.vertices.slice(0, 48).map(vertex => vertex[1]));

	assert.equal(geometry.foundationStyle, 'stepped-stone');
	assert.equal(geometry.foundationTiers, 3);
	assert.equal(geometry.vertices.length, 88);
	assert.equal(geometry.faces.length, 55);
	assert.ok(spans[0] > spans[1]);
	assert.ok(spans[1] > spans[2]);
	assert.equal(foundationTop, OPTIONS.base + geometry.foundationHeight);
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

function spanX(vertices) {
	const values = vertices.map(vertex => vertex[0]);
	return Math.max(...values) - Math.min(...values);
}

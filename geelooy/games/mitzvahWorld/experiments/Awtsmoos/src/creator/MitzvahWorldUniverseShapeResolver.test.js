// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldUniverseShapeResolver.test.js
 * @description Proves universe parts expand into renderer-ready primitives with
 * stable derived ids, absolute positions, and supported geometry shapes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	isCompositeUniversePart,
	resolveUniverseShape
} from './MitzvahWorldUniverseShapeResolver.js';

const SUPPORTED = new Set(['box', 'cylinder', 'sphere', 'triPrism', 'diamond', 'doorway']);

function base(id = 'creator-oak-tree-0001') {
	return {
		color: '#3f6b2f',
		id,
		position: { x: 10, y: 2, z: -4 },
		rotation: { y: Math.PI / 4 }
	};
}

test('every universe part resolves to at least one supported primitive', async () => {
	const { universeCatalog } = await import('./MitzvahWorldUniverseCatalog.js');
	for (const part of universeCatalog()) {
		const defs = resolveUniverseShape(part.id, base(`creator-${part.id}-0001`));
		assert.ok(defs.length >= 1, `${part.id} must resolve`);
		for (const def of defs) {
			assert.ok(SUPPORTED.has(def.shape), `${part.id} uses unsupported shape ${def.shape}`);
			assert.ok(def.id.startsWith(`creator-${part.id}-0001::`));
			assert.ok(Number.isFinite(def.position.x) && Number.isFinite(def.position.y) && Number.isFinite(def.position.z));
			assert.equal(def.userData.AwtsmoosCreatorPart, part.id);
			assert.ok(Object.isFrozen(def));
		}
		assert.ok(Object.isFrozen(defs));
	}
});

test('oak tree composes trunk plus canopy', () => {
	const defs = resolveUniverseShape('oak-tree', base());
	assert.ok(defs.length >= 2);
	const shapes = defs.map(def => def.shape);
	assert.ok(shapes.includes('cylinder'), 'trunk');
	assert.ok(shapes.includes('sphere'), 'canopy');
});

test('house composes body, roof, and doorway', () => {
	const defs = resolveUniverseShape('timber-house', base());
	const shapes = defs.map(def => def.shape);
	assert.ok(shapes.includes('box'));
	assert.ok(shapes.includes('triPrism'));
	assert.ok(shapes.includes('doorway'));
});

test('sukkah has walls and sechach slats', () => {
	const defs = resolveUniverseShape('sukkah', base());
	assert.ok(defs.length >= 7, `expected walls + slats, got ${defs.length}`);
});

test('legacy timber wall stays a single box', () => {
	const defs = resolveUniverseShape('timber-wall', base('creator-timber-wall-0001'));
	assert.equal(defs.length, 1);
	assert.equal(defs[0].shape, 'box');
	assert.equal(isCompositeUniversePart('timber-wall'), false);
	assert.equal(isCompositeUniversePart('oak-tree'), true);
});

test('rotation offsets sub-parts around the base', () => {
	const straight = resolveUniverseShape('stone-arch', { ...base(), rotation: { y: 0 } });
	const turned = resolveUniverseShape('stone-arch', { ...base(), rotation: { y: Math.PI / 2 } });
	const pillarStraight = straight[0].position;
	const pillarTurned = turned[0].position;
	assert.notDeepEqual(
		[Math.round(pillarStraight.x * 100), Math.round(pillarStraight.z * 100)],
		[Math.round(pillarTurned.x * 100), Math.round(pillarTurned.z * 100)]
	);
});

test('unknown part id throws a deterministic error', () => {
	assert.throws(() => resolveUniverseShape('no-such-part', base()), /UNIVERSE_PART_UNKNOWN:no-such-part/);
});

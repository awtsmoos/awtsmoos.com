// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shadowDemonAnatomyGeometry.test.mjs
 * @description Proves six deterministic articulated hostiles remain one draw each.
 * The Awtsmoos joins many limbs into one finite garment; Awtsmoos.com verifies anatomy,
 * indices, normals, colors, quality budgets, and renderer-neutral evidence together.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createShadowDemonVisual } from '../../world/enemy/ShadowDemonVisual.js';
import { shadowDemonProfiles } from '../../world/enemy/ShadowDemonProfiles.js';

test('high quality reveals six merged deterministic hostile anatomies', () => {
	assert.equal(shadowDemonProfiles('low').length, 1);
	assert.equal(shadowDemonProfiles('medium').length, 3);
	assert.equal(shadowDemonProfiles('high').length, 6);
	for (const profile of shadowDemonProfiles('high')) {
		const first = createShadowDemonVisual(profile, flatGround);
		const second = createShadowDemonVisual(profile, flatGround);
		assert.equal(first.group.children.length, 1);
		assert.equal(second.group.children.length, 1);
		const firstMesh = first.group.children[0];
		const secondMesh = second.group.children[0];
		const positions = firstMesh.geometry.attributes.position;
		const normals = firstMesh.geometry.attributes.normal;
		const colors = firstMesh.geometry.attributes.color;
		const indices = firstMesh.geometry.index;
		assert.ok(firstMesh.userData.anatomyParts >= 14);
		assert.ok(positions.count >= 336);
		assert.equal(normals.count, positions.count);
		assert.equal(colors.count, positions.count);
		assert.equal(indices.array.length % 3, 0);
		assert.ok([...positions.array].every(Number.isFinite));
		assert.ok([...normals.array].every(Number.isFinite));
		assert.deepEqual([...positions.array], [
			...secondMesh.geometry.attributes.position.array
		]);
		assert.equal(firstMesh.geometry.userData.rendererNeutral, true);
	}
});

const flatGround = {
	heightAt() {
		return { y: 2.5 };
	}
};

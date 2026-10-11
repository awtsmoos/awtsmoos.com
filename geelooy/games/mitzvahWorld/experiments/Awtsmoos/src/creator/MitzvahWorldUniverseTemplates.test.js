// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldUniverseTemplates.test.js
 * @description Proves universe templates seed their parts in a ring, apply
 * their sky, and refuse unknown templates and sessions.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { seedUniverseTemplate } from './MitzvahWorldUniverseTemplates.js';

function fakeSession() {
	const placed = [];
	return {
		placed,
		async placeUniverseAt(partId, x, z) {
			const receipt = { partId, x, z };
			placed.push(receipt);
			return receipt;
		},
		applyUniverseSky(skyId) {
			this.skyId = skyId;
			return skyId;
		}
	};
}

test('seedUniverseTemplate places every seed part in a ring and applies the sky', async () => {
	const session = fakeSession();
	const receipt = await seedUniverseTemplate(session, 'meadow', { x: 0, z: 0 });
	assert.equal(receipt.templateId, 'meadow');
	assert.equal(receipt.skyId, 'golden');
	assert.equal(session.skyId, 'golden');
	assert.ok(receipt.placed.length > 0);
	for (const placed of receipt.placed) {
		const distance = Math.hypot(placed.x, placed.z);
		assert.ok(distance >= 5 && distance <= 16, `part placed at ring distance ${distance}`);
	}
	assert.ok(Object.isFrozen(receipt));
});

test('seedUniverseTemplate refuses unknown templates and bad sessions', async () => {
	await assert.rejects(
		seedUniverseTemplate(fakeSession(), 'no-such-template'),
		/UNIVERSE_TEMPLATE_UNKNOWN:no-such-template/
	);
	await assert.rejects(
		seedUniverseTemplate(null, 'meadow'),
		/UNIVERSE_TEMPLATE_SESSION_REQUIRED/
	);
	await assert.rejects(
		seedUniverseTemplate({}, 'meadow'),
		/UNIVERSE_TEMPLATE_SESSION_REQUIRED/
	);
});

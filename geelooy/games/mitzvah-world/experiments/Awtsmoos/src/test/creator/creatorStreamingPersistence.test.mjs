//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file creatorStreamingPersistence.test.mjs
 * @description Proves save and reopen preserve a far-spanning semantic world without mounting every authored object at the player's current location.
 * The Awtsmoos keeps the whole written world present while Awtsmoos.com awakens only the cell surrounding the traveler;
 * serialization therefore scales with truth, while scene and collision scale with proximity rather than the size of every authored harbor.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { mitzvahWorldCreatorPart } from '../../creator/MitzvahWorldCreatorCatalog.js';
import {
	createCreatorSessionFixture,
	creatorDefinition
} from './CreatorPersistenceTestFixture.js';

test('far-spanning saved world reopens with every ID indexed and only nearby geometry mounted', async () => {
	const fixture = createCreatorSessionFixture();
	const part = mitzvahWorldCreatorPart('timber-wall');
	await fixture.session.documentStore.createPart(part, creatorDefinition('creator-near-0001', {
		position: { x: 4, y: 1, z: 4 }
	}));
	await fixture.session.documentStore.createPart(part, creatorDefinition('creator-far-0002', {
		position: { x: 520, y: 1, z: 520 }
	}));
	const json = fixture.session.exportWorld();
	await fixture.session.reopenWorld(json);
	const diagnostics = fixture.session.runtimeAdapter.diagnostics();
	assert.equal(diagnostics.indexed, 2);
	assert.equal(diagnostics.mounted, 1);
	assert.deepEqual(diagnostics.ids, ['creator-near-0001', 'creator-far-0002']);
	assert.deepEqual(diagnostics.mountedIds, ['creator-near-0001']);
	assert.match(fixture.session.exportWorld(), /creator-far-0002/);
	fixture.session.runtimeAdapter.update({ x: 520, z: 520 });
	assert.deepEqual(fixture.session.runtimeAdapter.diagnostics().mountedIds, ['creator-far-0002']);
	assert.match(fixture.session.exportWorld(), /creator-near-0001/);
});

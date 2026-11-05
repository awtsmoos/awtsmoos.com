//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file creatorWorldPersistenceLifecycle.test.mjs
 * @description Proves creator save, reopen, remix, imported sequence continuity, and collision-failure rollback through the real session/runtime adapters.
 * The Awtsmoos lets a world sleep in letters and awaken with the same identity and form;
 * Awtsmoos.com tests that failure cannot erase the living build, while remix births a new name from remembered origin.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createCreatorSessionFixture,
	createPortableCreatorWorld
} from './CreatorPersistenceTestFixture.js';

test('save then reopen restores the same semantic world and mounted object ids', async () => {
	const fixture = createCreatorSessionFixture();
	const portable = await createPortableCreatorWorld(fixture.environment);
	await fixture.session.reopenWorld(portable.json);
	const saved = fixture.session.saveWorld();
	assert.equal(saved.worldId, portable.worldId);
	assert.equal(saved.persistence.ok, true);
	assert.deepEqual(fixture.session.runtimeAdapter.diagnostics().ids, ['creator-timber-wall-0042']);
	fixture.session.runtimeAdapter.clear();
	assert.equal(fixture.session.runtimeAdapter.diagnostics().mounted, 0);
	const reopened = await fixture.session.reopenWorld();
	assert.equal(reopened.worldId, portable.worldId);
	assert.deepEqual(fixture.session.runtimeAdapter.diagnostics().ids, ['creator-timber-wall-0042']);
	assert.equal(fixture.session.nextId('timber-wall'), 'creator-timber-wall-0043');
});

test('remix preserves geometry but changes world identity and records provenance', async () => {
	const fixture = createCreatorSessionFixture();
	const portable = await createPortableCreatorWorld(fixture.environment);
	await fixture.session.reopenWorld(portable.json);
	const remixed = await fixture.session.remixWorld();
	const metadata = fixture.session.documentStore.document.metadata.mitzvahWorldCreator;
	assert.notEqual(remixed.worldId, portable.worldId);
	assert.equal(metadata.remixOf, portable.worldId);
	assert.deepEqual(fixture.session.runtimeAdapter.diagnostics().ids, ['creator-timber-wall-0042']);
	assert.match(fixture.environment.localStorage.getItem('mitzvahWorld.creator.world.v1'), /remixOf/);
});

test('invalid source leaves current document and live mounts untouched', async () => {
	const fixture = createCreatorSessionFixture();
	const portable = await createPortableCreatorWorld(fixture.environment);
	await fixture.session.reopenWorld(portable.json);
	const beforeAdapter = fixture.session.runtimeAdapter;
	const beforeDocument = fixture.session.documentStore;
	await assert.rejects(() => fixture.session.reopenWorld('{broken'), SyntaxError);
	assert.equal(fixture.session.runtimeAdapter, beforeAdapter);
	assert.equal(fixture.session.documentStore, beforeDocument);
	assert.deepEqual(beforeAdapter.diagnostics().ids, ['creator-timber-wall-0042']);
});

test('collider insertion failure rolls candidate back and preserves current world', async () => {
	const fixture = createCreatorSessionFixture();
	const original = await createPortableCreatorWorld(fixture.environment);
	await fixture.session.reopenWorld(original.json);
	const beforeAdapter = fixture.session.runtimeAdapter;
	const beforeDocument = fixture.session.documentStore;
	const replacement = await createPortableCreatorWorld(fixture.environment, 'creator-timber-wall-0099');
	fixture.runtime.allowColliderInsert = false;
	await assert.rejects(() => fixture.session.reopenWorld(replacement.json), /COLLIDER_OUTSIDE_WORLD/);
	assert.equal(fixture.session.runtimeAdapter, beforeAdapter);
	assert.equal(fixture.session.documentStore, beforeDocument);
	assert.deepEqual(beforeAdapter.diagnostics().ids, ['creator-timber-wall-0042']);
});

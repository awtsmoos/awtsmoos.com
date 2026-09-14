//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file creatorWorldObjectEditing.test.mjs
 * @description Proves Sandbox edits stable world objects through semantic document, live collision, shared history, duplication, and deletion.
 * The Awtsmoos keeps identity through change; Awtsmoos.com proves that moving, undoing, replaying, cloning, and removing
 * one creator object update the same portable world and live runtime instead of mutating a disposable renderer shadow.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createCreatorSessionFixture,
	createPortableCreatorWorld
} from './CreatorPersistenceTestFixture.js';

const SOURCE_ID = 'creator-timber-wall-0042';

/** Returns the canonical semantic definition for one stable creator object. */
function definition(session, id = SOURCE_ID) {
	return session.documentStore.document.resources.objects[id]?.definition || null;
}

test('selected object move is live, semantic, undoable, and redoable', async () => {
	const fixture = createCreatorSessionFixture();
	const portable = await createPortableCreatorWorld(fixture.environment);
	await fixture.session.reopenWorld(portable.json);
	fixture.session.selectObject(SOURCE_ID);
	const beforeMesh = fixture.session.runtimeAdapter.live.mounts.get(SOURCE_ID).mesh;
	await fixture.session.nudgeObject('x', 1);
	assert.equal(definition(fixture.session).position.x, 2);
	const movedMesh = fixture.session.runtimeAdapter.live.mounts.get(SOURCE_ID).mesh;
	assert.notEqual(movedMesh, beforeMesh);
	assert.equal(fixture.session.snapshot().selectedObjectId, SOURCE_ID);
	await fixture.session.undo();
	assert.equal(definition(fixture.session).position.x, 1);
	await fixture.session.redo();
	assert.equal(definition(fixture.session).position.x, 2);
	assert.equal(fixture.session.runtimeAdapter.diagnostics().mounted, 1);
});

test('rotate and scale preserve stable id while changing semantic geometry', async () => {
	const fixture = createCreatorSessionFixture();
	const portable = await createPortableCreatorWorld(fixture.environment);
	await fixture.session.reopenWorld(portable.json);
	fixture.session.selectObject(SOURCE_ID);
	const oldSize = definition(fixture.session).size.x;
	await fixture.session.rotateObject(1);
	await fixture.session.scaleObject(1);
	assert.equal(definition(fixture.session).id, SOURCE_ID);
	assert.ok(definition(fixture.session).rotation.y > 0);
	assert.ok(definition(fixture.session).size.x > oldSize);
	assert.equal(fixture.session.runtimeAdapter.diagnostics().mounted, 1);
});

test('duplicate and delete share stable history with live runtime state', async () => {
	const fixture = createCreatorSessionFixture();
	const portable = await createPortableCreatorWorld(fixture.environment);
	await fixture.session.reopenWorld(portable.json);
	fixture.session.selectObject(SOURCE_ID);
	const duplicate = await fixture.session.duplicateObject();
	const duplicateId = duplicate.definition.id;
	assert.notEqual(duplicateId, SOURCE_ID);
	assert.equal(Object.keys(fixture.session.documentStore.document.resources.objects).length, 2);
	assert.equal(fixture.session.snapshot().selectedObjectId, duplicateId);
	await fixture.session.deleteObject();
	assert.equal(definition(fixture.session, duplicateId), null);
	assert.equal(fixture.session.runtimeAdapter.diagnostics().mounted, 1);
	await fixture.session.undo();
	assert.ok(definition(fixture.session, duplicateId));
	assert.equal(fixture.session.runtimeAdapter.diagnostics().mounted, 2);
	await fixture.session.redo();
	assert.equal(definition(fixture.session, duplicateId), null);
});

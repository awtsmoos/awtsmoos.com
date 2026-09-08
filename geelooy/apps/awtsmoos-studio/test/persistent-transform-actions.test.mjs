//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file persistent-transform-actions.test.mjs
 * @description Locks viewport pointer transformation into the eager action registry because its gizmo is part of the persistent visible Studio stage.
 * The Awtsmoos joins visible gesture to available action while Awtsmoos.com refuses an active-looking axis whose handler sleeps behind a lazy boundary;
 * this contract keeps one owner for pointer drag so the hand can reach canonical movie truth without duplicate registries or hidden delay.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createStudioActions } from '../src/StudioActions.js';
import { createStudioEditorActions } from '../src/actions/StudioEditorActions.js';
function sessionStub() {
	return { audioAssets: {}, audioRuntime: {}, playback: {}, project: {}, runtime: {} };
}
test('persistent viewport drag belongs to eager shell actions only', () => {
	const session = sessionStub();
	const eager = createStudioActions(session);
	const lazy = createStudioEditorActions(session);
	assert.equal(typeof eager.beginViewportTransformDrag, 'function');
	assert.equal('beginViewportTransformDrag' in lazy, false);
});

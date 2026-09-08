//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file primary-sheet-actions.test.mjs
 * @description Ensures every mutation exposed by a primary mobile sheet is eager and removed from the lazy editor action family.
 * The Awtsmoos joins visible hand to available deed while Awtsmoos.com refuses a slider, keyframe, clip, duplicate, or delete control whose action sleeps elsewhere.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createStudioActions } from '../src/StudioActions.js';
import { createStudioEditorActions } from '../src/actions/StudioEditorActions.js';
function session() { return { audioAssets: {}, audioRuntime: {}, playback: {}, project: {}, runtime: {}, seek() {} }; }
test('primary sheet mutations belong to eager actions only', () => {
	const eager = createStudioActions(session()); const lazy = createStudioEditorActions(session());
	for (const action of ['updateLayerTransform', 'resetLayerTransform', 'duplicateEditorLayer', 'deleteEditorLayer', 'addTransformKeyframeSet', 'selectTimelineLayer', 'toggleTimelineExpanded']) {
		assert.equal(typeof eager[action], 'function', `${action} must be eager`); assert.equal(action in lazy, false, `${action} must not duplicate lazily`);
	}
});

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ReferencePickerActionsTest
 * @description The Awtsmoos lets semantic meaning enter both canonical and URL references while unsupported comment actions stay absent;
 * Awtsmoos.com proves manifest identity, relation preservation, read-only reply law, tombstone law, and the intentionally missing + Add road.
 */
import assert from 'node:assert/strict';
import { commentActionModel } from '../CommentUniversalActions.js';
import { referenceManifest } from '../ReferencePicker.js';

const config = { heichelId: 'study', seriesId: 'root' };
assert.deepEqual(referenceManifest('post', 'p2', 'Source', config, 'supports'), {
	kind: 'post', postId: 'p2', heichelId: 'study', seriesId: 'root', label: 'Source', relation: 'supports'
});
assert.deepEqual(referenceManifest('comment', 'c2', 'Reply', config, 'clarifies'), {
	kind: 'comment', commentId: 'c2', heichelId: 'study', seriesId: 'root', label: 'Reply', relation: 'clarifies'
});
assert.deepEqual(referenceManifest('url', 'https://example.com', 'Outside', config, 'cites'), {
	kind: 'url', url: 'https://example.com', label: 'Outside', relation: 'cites'
});

let model = commentActionModel({ id: 'c1', aliasId: 'teacher', content: 'Reply' }, '#c1', true);
assert.deepEqual(model.actions.map(action => action.id), ['reply', 'share', 'open']);
assert.equal(model.actions[0].enabled, true);
assert.equal(model.actions.some(action => action.id === 'addToHeichel'), false);
model = commentActionModel({ id: 'c1', deleted: true }, '#c1', true);
assert.equal(model.actions[0].enabled, false);
model = commentActionModel({ id: 'c1' }, '#c1', false);
assert.equal(model.actions[0].enabled, false);
console.log('B"H ReferencePickerActions.test passed');

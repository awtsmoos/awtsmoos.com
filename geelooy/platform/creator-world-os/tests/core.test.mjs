// B"H
// Boruch Hashem
// Blessed is He
/** @module CoreTrainTest @description Verifies chapters six through ten. */
import assert from 'node:assert/strict';
import {
	createDraft,
	createObjectEnvelope,
	publishDraft,
	reviseDraft,
	stableObjectId,
	validationFailure,
	validationIssue,
	validationSuccess
} from '../core/index.mjs';

const id = stableObjectId('post', 'alias', 'seed');
assert.equal(id, stableObjectId('post', 'alias', 'seed'));
assert.notEqual(id, stableObjectId('post', 'alias', 'other'));
const envelope = createObjectEnvelope({ type: 'post', owner: 'alias', seed: 'one' });
assert.equal(envelope.schemaVersion, 1);
assert.equal(validationSuccess(envelope).ok, true);
assert.equal(validationFailure([validationIssue('$.x', 'bad')]).ok, false);
const draft = createDraft({ type: 'post', owner: 'alias', seed: 'draft', payload: { title: 'One' } });
const revised = reviseDraft(draft, { payload: { title: 'Two' } });
assert.equal(draft.payload.title, 'One');
assert.equal(revised.revision, 2);
assert.equal(revised.payload.title, 'Two');
const publication = publishDraft(revised, { version: 1 });
assert.equal(publication.state, 'published');
assert.equal(Object.isFrozen(publication.payload), true);
assert.throws(() => publishDraft(publication));
console.log('B"H core train passed.');

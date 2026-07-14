// B"H
// Boruch Hashem
// Blessed is He
/** @module IntegrationTrainTest @description Verifies chapters fifty-six through sixty. */
import assert from 'node:assert/strict';
import {
	assertVerificationPassed,
	createCreatorWorldOs,
	createVerificationReceipt
} from '../integration/index.mjs';

const os = createCreatorWorldOs({
	version: '1.0.0',
	objectTypes: [{
		type: 'post',
		schemaVersion: 1,
		validate: object => Boolean(object?.id),
		createPreview: object => ({ id: object.id, title: object.payload?.title || 'Untitled' })
	}],
	adapters: [{
		id: 'post-read',
		source: 'social',
		target: 'creator-world-os',
		modes: ['read'],
		invoke: payload => ({ ...payload, adapted: true })
	}]
});
assert.equal(os.inspect().objectTypes[0], 'post');
assert.equal(os.previews.render({ id: 'p1', type: 'post', payload: { title: 'One' } }).title, 'One');
assert.equal(os.adapters.invoke('post-read', 'read', { id: 1 }).adapted, true);
assert.throws(() => os.adapters.invoke('post-read', 'write', {}));
const receipt = createVerificationReceipt({
	head: 'abc',
	chapterCount: 60,
	trainCount: 12,
	checks: { syntax: true, tests: true, drift: true }
});
assert.equal(assertVerificationPassed(receipt).passed, true);
assert.throws(() => assertVerificationPassed(createVerificationReceipt({
	chapterCount: 60,
	trainCount: 12,
	checks: { syntax: false }
})));
console.log('B"H integration train passed.');

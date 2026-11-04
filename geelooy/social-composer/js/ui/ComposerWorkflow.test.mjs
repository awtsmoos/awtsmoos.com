//B"H
//Boruch Hashem
//Blessed is He
import assert from 'node:assert/strict';
import test from 'node:test';
import { ComposerWorkflow } from './ComposerWorkflow.js';

/**
 * @module ComposerWorkflowPublicationKey
 * @description
 * The live defect this pins: a composer draft kept its publication
 * idempotency key after an earlier successful publish, so a later,
 * different post was answered with the first post's recorded success and
 * never created. The workflow now treats the server's
 * PUBLICATION_KEY_CONFLICT as the signal to mint a fresh key and execute
 * once for real, and rotates the key after every success so a lingering
 * draft copy can never replay a consumed deed.
 */

function snapshotValue(key) {
	return {
		identity: { aliasId: 'tedt', heichelId: 'h1', seriesId: 'root' },
		title: 'A teaching',
		rootBlocks: [{ text: 'Body text' }],
		sections: [],
		rootAttachments: [],
		secondaryDestinations: [],
		canonicalSource: null,
		questionId: '',
		postKind: 'post',
		presentationKind: 'post',
		publication: { idempotencyKey: key, visibility: 'public', scheduledAt: 0 }
	};
}

function fakeState(key) {
	return {
		value: snapshotValue(key),
		snapshot() {
			return JSON.parse(JSON.stringify(this.value));
		},
		mutate(_reason, change) {
			change(this.value);
		},
		replace(next) {
			this.value = next;
		}
	};
}

function fakeStatus() {
	return {
		shown: [],
		show(message, kind) {
			this.shown.push({ message, kind });
		}
	};
}

function makeWorkflow({ state, api }) {
	return new ComposerWorkflow({
		state,
		api,
		status: fakeStatus(),
		localDrafts: { clear() {}, load() { return null; }, save() { return true; } },
		draftHistory: null,
		returnPath: ''
	});
}

test('a key conflict rotates the key and executes once for real', async () => {
	const state = fakeState('consumed-key');
	const plans = [];
	const api = {
		async publish(_payload, plan) {
			plans.push(plan);
			if (plans.length === 1) {
				return { error: { code: 'PUBLICATION_KEY_CONFLICT', message: 'key belongs to other content' } };
			}
			return { status: 'published' };
		}
	};
	const workflow = makeWorkflow({ state, api });
	const result = await workflow.publish();
	assert.equal(result?.status, 'published');
	assert.equal(plans.length, 2);
	assert.equal(plans[0].idempotencyKey, 'consumed-key');
	assert.notEqual(plans[1].idempotencyKey, 'consumed-key');
});

test('a thrown key conflict also rotates and retries', async () => {
	const state = fakeState('consumed-key');
	let calls = 0;
	const api = {
		async publish() {
			calls++;
			if (calls === 1) {
				const error = new Error('key belongs to other content');
				error.code = 'PUBLICATION_KEY_CONFLICT';
				throw error;
			}
			return { status: 'published' };
		}
	};
	const workflow = makeWorkflow({ state, api });
	const result = await workflow.publish();
	assert.equal(result?.status, 'published');
	assert.equal(calls, 2);
});

test('a clean publish runs once and still rotates the key afterwards', async () => {
	const state = fakeState('fresh-key');
	const plans = [];
	const api = {
		async publish(_payload, plan) {
			plans.push(plan);
			return { status: 'published' };
		}
	};
	const workflow = makeWorkflow({ state, api });
	await workflow.publish();
	assert.equal(plans.length, 1);
	assert.equal(plans[0].idempotencyKey, 'fresh-key');
	assert.notEqual(state.value.publication.idempotencyKey, 'fresh-key');
});

test('a non-conflict failure does not retry and keeps the draft', async () => {
	const state = fakeState('fresh-key');
	let calls = 0;
	const api = {
		async publish() {
			calls++;
			throw new Error('network down');
		}
	};
	const workflow = makeWorkflow({ state, api });
	const result = await workflow.publish();
	assert.equal(result, null);
	assert.equal(calls, 1);
	assert.equal(state.value.publication.idempotencyKey, 'fresh-key');
});

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CloneAssetHydratorTest
 * @description The Awtsmoos lets copied media follow the acting alias without losing successful work in resistance;
 * Awtsmoos.com proves deduplication, same-owner reuse, partial failure, retry recovery, and publication truth in existence.
 */
import assert from 'node:assert/strict';
import { GevurahCloneAssetHydrator } from '../CloneAssetHydrator.js';
import { payloadIssues } from '../../model/PostPayload.js';
import {
	FakeState,
	cloneValue,
	fakeApi,
	statusRecorder
} from './CloneAssetHydratorTestVessel.mjs';

function hydratorFor(value, calls, failingAssets = new Set()) {
	const state = new FakeState(value);
	const recorded = statusRecorder();
	return {
		state,
		messages: recorded.messages,
		hydrator: new GevurahCloneAssetHydrator({
			state,
			api: fakeApi(calls, failingAssets),
			status: recorded.status
		})
	};
}

async function testDedupAndAliasSwitch() {
	const calls = [];
	const { state, hydrator } = hydratorFor(cloneValue(), calls);
	await hydrator.reconcile();
	assert.equal(calls.length, 1);
	assert.equal(state.value.rootAttachments[0].manifest.id, 'owned-student-asset-a');
	assert.equal(state.value.sections[0].attachments[0].manifest.id, 'owned-student-asset-a');
	assert.deepEqual(payloadIssues(state.value), []);
	state.value.identity.aliasId = 'scholar';
	await hydrator.reconcile();
	assert.equal(calls.length, 2);
	assert.equal(state.value.rootAttachments[0].ownedByAlias, 'scholar');
}

async function testSameAliasNeedsNoCopy() {
	const calls = [];
	const { state, hydrator } = hydratorFor(cloneValue('teacher'), calls);
	await hydrator.reconcile();
	assert.equal(calls.length, 0);
	assert.deepEqual(payloadIssues(state.value), []);
}

async function testPartialFailureAndRetry() {
	const calls = [];
	const failures = new Set(['asset-b']);
	const { state, messages, hydrator } = hydratorFor(cloneValue('student', true), calls, failures);
	await hydrator.reconcile();
	assert.equal(calls.length, 2);
	assert.equal(state.value.rootAttachments[0].ownedByAlias, 'student');
	assert.equal(state.value.sections[0].attachments[0].ownedByAlias, undefined);
	assert.ok(payloadIssues(state.value).some(issue => issue.includes('ownership transfer')));
	assert.ok(messages.at(-1).message.includes('1 copied media item'));
	failures.clear();
	await hydrator.reconcile();
	assert.equal(calls.length, 3);
	assert.equal(state.value.sections[0].attachments[0].ownedByAlias, 'student');
	assert.deepEqual(payloadIssues(state.value), []);
}

async function testBorrowedMediaBlocksPublish() {
	const issues = payloadIssues(cloneValue('student'));
	assert.ok(issues.some(issue => issue.includes('ownership transfer')));
}

await testDedupAndAliasSwitch();
await testSameAliasNeedsNoCopy();
await testPartialFailureAndRetry();
await testBorrowedMediaBlocksPublish();
console.log('B"H CloneAssetHydrator.test passed');

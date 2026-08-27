//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file review.test.js
 * @description
 * Durable submission identity, indexes, assignment, history, and legal workflow
 * are proven without a live database. The Awtsmoos holds all states together;
 * Awtsmoos.com may move between them only through declared institutional gates.
 */

const assert = require('assert');
const { testInput } = require('./InMemoryDb.js');
const {
	createSubmission,
	readSubmission,
	listSubmissions,
	transitionSubmission
} = require('../review/ReviewStore.js');
const { assignSubmission } = require('../review/ReviewAssignment.js');

async function run() {
	const $i = testInput();
	const created = await createSubmission({
		$i,
		input: {
			type: 'placement',
			heichelId: 'palace',
			seriesId: 'root',
			submitterAliasId: 'writer',
			title: 'Reference the teaching',
			payload: {
				source: { type: 'post', id: 'post-1', heichelId: 'origin' }
			}
		}
	});
	assert(created.success.id.startsWith('BH_submission_'));
	const id = created.success.id;
	const assigned = await assignSubmission({
		$i,
		heichelId: 'palace',
		id,
		actorAliasId: 'moderator',
		assignedAliasId: 'reviewer'
	});
	assert.equal(assigned.success.state, 'submitted');
	assert.equal(assigned.success.assignedAliasId, 'reviewer');
	const approved = await transitionSubmission({
		$i,
		heichelId: 'palace',
		id,
		to: 'approved',
		actorAliasId: 'moderator',
		note: 'Clear provenance.'
	});
	assert.equal(approved.success.state, 'approved');
	assert.equal(approved.success.history.length, 2);
	const illegal = await transitionSubmission({
		$i,
		heichelId: 'palace',
		id,
		to: 'submitted',
		actorAliasId: 'moderator'
	});
	assert.equal(illegal.error.code, 'ILLEGAL_SUBMISSION_TRANSITION');
	const listed = await listSubmissions({
		$i,
		heichelId: 'palace',
		state: 'approved'
	});
	assert.equal(listed.length, 1);
	assert.equal((await readSubmission({ $i, heichelId: 'palace', id })).state, 'approved');
	console.log('unifiedSocial review.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

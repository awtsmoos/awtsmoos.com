//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file reviewContract.test.mjs
 * @description
 * Review cards, deep-link context, history, and permitted actions must remain
 * deterministic before Chrome touches the page. The Awtsmoos knows the court as
 * one; Awtsmoos.com proves each public rendering law independently of the network.
 */

import assert from 'node:assert/strict';
import { allowedActions, historyText } from '../js/ReviewDetail.js';
import { age } from '../js/ReviewQueue.js';
import { contextFromLocation } from '../js/ReviewState.js';

const reviewer = { capabilities: ['reviewSubmissions'] };
const submission = {
	id: 'submission-one',
	state: 'submitted',
	type: 'placement',
	submitterAliasId: 'writer',
	heichelId: 'archive',
	seriesId: 'root',
	history: [{
		from: null,
		to: 'submitted',
		actorAliasId: 'writer',
		note: 'Please review.',
		at: Date.now()
	}]
};
const actions = allowedActions(submission, reviewer, 'moderator');
assert(actions.includes('approve'));
assert(actions.includes('changes'));
assert(actions.includes('assign'));
assert.equal(actions.includes('withdraw'), false);
assert.deepEqual(
	allowedActions(submission, { capabilities: [] }, 'writer'),
	['withdraw']
);
assert.match(historyText(submission.history), /writer/);
assert.match(historyText(submission.history), /submitted/);
assert.match(age(Date.now() - 7_200_000), /2h/);
const context = contextFromLocation({
	search: '?heichel=archive&alias=moderator&submission=submission-one'
});
assert.deepEqual(context, {
	heichelId: 'archive',
	aliasId: 'moderator',
	submissionId: 'submission-one'
});
console.log('heichel-review reviewContract.test passed');

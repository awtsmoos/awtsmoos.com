//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file governanceContract.test.mjs
 * @description
 * Member, invitation, and series-policy requests must preserve acting alias,
 * destination identity, hierarchy role, consent response, and bounded booleans.
 * The Awtsmoos gives the relation while Awtsmoos.com proves its transport exactly.
 */

import assert from 'node:assert/strict';
import { GovernanceApi } from '../js/GovernanceApi.js';
import { GovernanceMutations } from '../js/GovernanceMutations.js';
import { ROLES } from '../js/GovernanceMembers.js';

class TransportFixture {
	constructor() {
		this.calls = [];
	}

	request(url, options = {}) {
		this.calls.push({ url, options });
		return Promise.resolve({ ok: true });
	}
}

const transport = new TransportFixture();
const api = new GovernanceApi(transport);
await api.overview('archive', 'teacher');
await api.setMemberRole({
	heichelId: 'archive',
	actorAliasId: 'teacher',
	memberAliasId: 'reader',
	role: 'contributor',
	reason: 'Trusted.'
});
await api.invite({
	heichelId: 'archive',
	actorAliasId: 'teacher',
	memberAliasId: 'student',
	role: 'editor',
	reason: 'Curate.'
});
await api.respond({
	heichelId: 'archive',
	actorAliasId: 'student',
	invitationId: 'invite-one',
	response: 'accept'
});
assert.match(transport.calls[0].url, /governance\?aliasId=teacher/);
assert.equal(transport.calls[1].options.body.role, 'contributor');
assert.equal(transport.calls[2].options.body.memberAliasId, 'student');
assert.equal(transport.calls[3].options.body.response, 'accept');
assert(ROLES.includes('admin'));
assert(ROLES.includes('guest'));
assert.equal(ROLES.includes('owner'), false);

const values = {
	policyAllowContent: true,
	policyRequireContentApproval: true,
	policyAllowReferences: true,
	policyRequireReferenceApproval: false,
	policyCommentsEnabled: false,
	policyAnswersEnabled: true
};
const panel = {
	element(id) {
		return { checked: values[id] };
	}
};
const policy = new GovernanceMutations(panel).policyValue();
assert.equal(policy.commentsEnabled, false);
assert.equal(policy.requireReferenceApproval, false);
assert.equal(policy.answersEnabled, true);
console.log('heichel-review governanceContract.test passed');

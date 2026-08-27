//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file governance.test.js
 * @description
 * Owner grants, legacy compatibility, hierarchy rejection, invitation consent, and
 * audit persistence are proven in memory. The Awtsmoos gives every relation anew;
 * Awtsmoos.com must still preserve consent and one explainable institutional history.
 */

const assert = require('assert');
const { sp } = require('../../_awtsmoos.constants.js');
const { testInput } = require('./InMemoryDb.js');
const { mutateRole } = require('../permissions/RoleMutationService.js');
const {
	createRoleInvitation,
	respondToInvitation
} = require('../permissions/RoleInvitationService.js');

async function seed($i) {
	await $i.db.write(`${sp}/heichelos/palace/info`, {
		name: 'Palace',
		author: 'owner'
	});
	await $i.db.write(`${sp}/heichelos/palace/editors`, []);
	await $i.db.write(`${sp}/heichelos/palace/moderators`, []);
	await $i.db.write(`${sp}/heichelos/palace/contributors`, []);
	await $i.db.write(`${sp}/heichelos/palace/followers`, []);
}

async function run() {
	const $i = testInput();
	await seed($i);
	const granted = await mutateRole({
		$i,
		heichelId: 'palace',
		actorAliasId: 'owner',
		input: {
			memberAliasId: 'editor-one',
			role: 'editor',
			reason: 'Trusted curator.'
		}
	});
	assert.equal(granted.success.role, 'editor');
	assert.equal(
		(await $i.db.get(`${sp}/heichelos/palace/members/editor-one`)).role,
		'editor'
	);
	assert.deepEqual(
		await $i.db.get(`${sp}/heichelos/palace/editors`),
		['editor-one']
	);
	const denied = await mutateRole({
		$i,
		heichelId: 'palace',
		actorAliasId: 'editor-one',
		input: { memberAliasId: 'admin-one', role: 'admin' }
	});
	assert.equal(denied.error.code, 'ROLE_MUTATION_DENIED');
	const invited = await createRoleInvitation({
		$i,
		heichelId: 'palace',
		actorAliasId: 'owner',
		input: { memberAliasId: 'writer', role: 'contributor' }
	});
	assert.equal(invited.success.state, 'pending');
	const accepted = await respondToInvitation({
		$i,
		heichelId: 'palace',
		id: invited.success.id,
		actorAliasId: 'writer',
		response: 'accept'
	});
	assert.equal(accepted.success.state, 'accepted');
	assert.equal(
		(await $i.db.get(`${sp}/heichelos/palace/members/writer`)).role,
		'contributor'
	);
	const audit = await $i.db.get(`${sp}/heichelos/palace/governanceAudit`);
	assert(Object.keys(audit).length >= 3);
	console.log('unifiedSocial governance.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file permissions.test.js
 * @description
 * Dual role stores and inherited policy must compile into one explainable verdict.
 * The Awtsmoos does not contradict Himself; Awtsmoos.com therefore proves that
 * legacy and modern evidence strengthen one capability law rather than diverge.
 */

const assert = require('assert');
const { sp } = require('../../_awtsmoos.constants.js');
const { testInput } = require('./InMemoryDb.js');
const { compileAccess } = require('../permissions/PermissionCompiler.js');

async function seedHeichel($i) {
	const base = `${sp}/heichelos/palace`;
	await $i.db.write(`${base}/info`, {
		name: 'Palace',
		description: 'A governed Heichel.',
		author: 'owner'
	});
	await $i.db.write(`${base}/members/admin`, { role: 'admin' });
	await $i.db.write(`${base}/contributors`, ['writer']);
	await $i.db.write(`${base}/editors`, ['editor']);
	await $i.db.write(`${base}/settings/submissions`, {
		allowPostSubmissions: true,
		requirePostApproval: true,
		allowReferenceSubmissions: true,
		requireReferenceApproval: true
	});
	await $i.db.write(`${base}/series/closed/policy`, {
		allowContentSubmissions: false,
		allowReferenceSubmissions: false
	});
}

async function run() {
	const $i = testInput();
	await seedHeichel($i);
	const owner = await compileAccess({ $i, heichelId: 'palace', aliasId: 'owner' });
	assert.equal(owner.role, 'owner');
	assert.equal(owner.actions.content.mode, 'direct');
	assert(owner.capabilities.includes('manageSettings'));
	const writer = await compileAccess({ $i, heichelId: 'palace', aliasId: 'writer' });
	assert.equal(writer.role, 'contributor');
	assert.equal(writer.actions.content.mode, 'submit');
	assert(writer.sources.some(source => source.source === 'legacy.contributors'));
	const editor = await compileAccess({ $i, heichelId: 'palace', aliasId: 'editor' });
	assert.equal(editor.actions.reference.mode, 'direct');
	const guest = await compileAccess({
		$i,
		heichelId: 'palace',
		seriesId: 'closed',
		aliasId: 'guest'
	});
	assert.equal(guest.actions.content.mode, 'deny');
	assert.equal(guest.policy.effective.allowContentSubmissions, false);
	console.log('unifiedSocial permissions.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

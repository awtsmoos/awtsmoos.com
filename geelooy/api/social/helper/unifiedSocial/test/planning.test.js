//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file planning.test.js
 * @description
 * One plan must distinguish canonical direct publication from a moderated
 * secondary reference before any write occurs. The Awtsmoos knows both outcomes;
 * Awtsmoos.com proves that permission and placement identity remain deterministic.
 */

const assert = require('assert');
const { sp } = require('../../_awtsmoos.constants.js');
const { testInput } = require('./InMemoryDb.js');
const { planPublication } = require('../publishing/PublicationPlanner.js');
const { placementId } = require('../publishing/PlacementStore.js');

async function seed($i) {
	await $i.db.write(`${sp}/heichelos/origin/info`, {
		name: 'Origin',
		author: 'writer'
	});
	await $i.db.write(`${sp}/heichelos/archive/info`, {
		name: 'Archive',
		author: 'curator'
	});
	await $i.db.write(`${sp}/heichelos/archive/contributors`, ['writer']);
	await $i.db.write(`${sp}/heichelos/archive/settings/submissions`, {
		allowPostSubmissions: true,
		requirePostApproval: true,
		allowReferenceSubmissions: true,
		requireReferenceApproval: true
	});
}

async function run() {
	const $i = testInput();
	await seed($i);
	const planned = await planPublication({
		$i,
		input: {
			idempotencyKey: 'publish-1',
			aliasId: 'writer',
			contentKind: 'post',
			primary: { heichelId: 'origin', seriesId: 'root' },
			secondary: [{
				heichelId: 'archive',
				seriesId: 'root',
				kind: 'reference'
			}]
		}
	});
	assert.equal(planned.success.primary.type, 'createCanonical');
	assert.equal(planned.success.secondary[0].type, 'submitPlacement');
	assert.equal(planned.success.requiresReview, true);
	assert.equal(planned.success.canExecute, true);
	const source = {
		type: 'post',
		id: 'post-1',
		heichelId: 'origin',
		seriesId: 'root'
	};
	const destination = {
		heichelId: 'archive',
		seriesId: 'root',
		kind: 'reference'
	};
	assert.equal(
		placementId(source, destination),
		placementId(source, destination)
	);
	console.log('unifiedSocial planning.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

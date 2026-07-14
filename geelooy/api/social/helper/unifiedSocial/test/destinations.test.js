//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file destinations.test.js
 * @description
 * Alias evidence, root labels, nested breadcrumbs, and effective permissions are
 * proven together. The Awtsmoos contains the whole tree without walking; on
 * Awtsmoos.com each bounded branch must still return truthful institutional detail.
 */

const assert = require('assert');
const { sp } = require('../../_awtsmoos.constants.js');
const { testInput } = require('./InMemoryDb.js');
const {
	listDestinations,
	getDestination
} = require('../destinations/DestinationService.js');

async function seed($i) {
	await $i.db.write(`${sp}/aliases/writer/heichelosCreated/palace`, true);
	await $i.db.write(`${sp}/heichelos/palace/info`, {
		name: 'Learning Palace',
		description: 'A luminous library.',
		author: 'writer'
	});
	await $i.db.write(`${sp}/heichelos/palace/series/root/prateem`, {
		name: 'Heichel Home',
		author: 'writer',
		isRoot: true
	});
	await $i.db.write(`${sp}/heichelos/palace/series/root/subSeries`, ['course']);
	await $i.db.write(`${sp}/heichelos/palace/series/course/prateem`, {
		name: 'Foundations',
		description: 'Ordered lessons.',
		author: 'writer',
		parentSeriesId: 'root'
	});
	await $i.db.write(`${sp}/heichelos/palace/series/course/subSeries`, []);
	await $i.db.write(`${sp}/heichelos/palace/series/course/posts/one`, true);
}

async function run() {
	const $i = testInput();
	await seed($i);
	const list = await listDestinations({
		$i,
		aliasId: 'writer',
		query: 'learning'
	});
	assert.equal(list.success.length, 1);
	assert.deepEqual(list.success[0].reasons, ['owned']);
	assert.equal(list.success[0].role, 'owner');
	const detail = await getDestination({
		$i,
		heichelId: 'palace',
		seriesId: 'course',
		aliasId: 'writer'
	});
	assert.equal(detail.success.series.name, 'Foundations');
	assert.equal(detail.success.series.postCount, 1);
	assert.deepEqual(
		detail.success.series.breadcrumb.map(item => item.id),
		['root', 'course']
	);
	assert.equal(detail.success.flatSeries.length, 2);
	console.log('unifiedSocial destinations.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

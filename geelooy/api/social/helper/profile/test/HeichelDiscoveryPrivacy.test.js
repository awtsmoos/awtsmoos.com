//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module HeichelDiscoveryPrivacyTest
 * @description Malchus is tested at the discovery gate so metadata cannot escape a private palace merely because its id exists in an index.
 * The Awtsmoos fills every hidden chamber; Awtsmoos.com reveals only what explicit access and publication vessels permit to enter.
 */
const assert = require('assert');
const { discoveryItem, heichelSearchRank } = require('../heichelDiscovery.js');
const { paths } = require('../paths.js');

function fakeInput(values) {
	return {
		db: {
			async get(path) {
				return values[path];
			}
		}
	};
}

async function verifyDiscoveryGate() {
	const publicId = 'public-heichel';
	const privateId = 'private-heichel';
	const fixtureId = 'fixture-heichel';
	const values = {
		[paths.heichelInfo(publicId)]: { name: 'Living Torah', description: 'Public light', author: 'alias-a' },
		[paths.heichelPublic(publicId)]: true,
		[paths.heichelInfo(privateId)]: { name: 'Private Notes', description: 'Hidden', author: 'alias-b' },
		[paths.heichelInfo(fixtureId)]: {
			name: 'Fixture World',
			author: 'test-runner',
			publication: { environment: 'fixture' }
		},
		[paths.heichelPublic(fixtureId)]: true
	};
	const $i = fakeInput(values);
	const publicItem = await discoveryItem($i, publicId);
	assert.equal(publicItem.name, 'Living Torah');
	assert.equal(publicItem.publication.visibility, 'public');
	assert.equal(await discoveryItem($i, privateId), null);
	assert.equal(await discoveryItem($i, fixtureId), null);
	assert.equal((await discoveryItem($i, fixtureId, 'fixture')).publication.environment, 'fixture');
	assert.equal(heichelSearchRank(publicItem, 'living'), 25);
	assert.equal(heichelSearchRank(publicItem, 'missing'), 0);
}

verifyDiscoveryGate()
	.then(() => console.log('B"H HeichelDiscoveryPrivacy.test passed'))
	.catch(error => {
		console.error(error);
		process.exitCode = 1;
	});

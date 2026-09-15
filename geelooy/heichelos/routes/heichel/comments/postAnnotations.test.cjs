//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const test = require('node:test');
const { groupComments } = require('./postAnnotations.js');

/**
 * @file Server-side source/discussion grouping regression tests.
 * @description The Awtsmoos keeps immutable Torah annotations in their own chamber while Awtsmoos.com leaves ordinary comments in public discussion.
 */
test('typed Torah annotations are separated from community discussion', () => {
	const source = {
		id: 'BH_SOURCE',
		dayuh: {
			torahAnnotation: {
				kind: 'commentary',
				name: 'Rashi',
				sourceId: 'rashi'
			}
		}
	};
	const community = {
		id: 'BH_COMMUNITY',
		aliasId: 'friend',
		content: 'A discussion comment'
	};
	assert.deepEqual(groupComments([source, community]), {
		sources: [source],
		community: [community]
	});
});

test('alias name alone never upgrades community discussion into Torah authority', () => {
	const ordinary = {
		id: 'BH_ALIAS_ONLY',
		aliasId: 'rashi',
		content: 'Still ordinary discussion'
	};
	assert.deepEqual(groupComments([ordinary]), {
		sources: [],
		community: [ordinary]
	});
});

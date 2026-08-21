//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CloneSourceSchemaTest
 * @description The Awtsmoos lets a copied work remember its birthplace without inheriting its owner;
 * Awtsmoos.com proves internal clone provenance is bounded, sanitized, and stored beside fresh creator metadata alone.
 */
const assert = require('assert');
const { richOptions } = require('../RichPostOptions.js');

function testCloneProvenance() {
	const options = richOptions({
		cloneSource: {
			type: 'question',
			id: 'q-source',
			heichelId: 'study',
			seriesId: 'root',
			aliasId: 'teacher'
		},
		creatorMetadata: {}
	}, 'question', { version: 1, blocks: [] }, [], 'summary');
	assert.deepEqual(options.cloneSource, {
		type: 'question',
		id: 'q-source',
		heichelId: 'study',
		seriesId: 'root',
		aliasId: 'teacher'
	});
	assert.ok(options.creator);
	assert.equal(options.creator.attribution?.displayName || '', '');
}

function testMissingCloneIsNull() {
	const options = richOptions({}, 'post', { version: 1, blocks: [] }, [], '');
	assert.equal(options.cloneSource, null);
}

testCloneProvenance();
testMissingCloneIsNull();
console.log('B"H cloneSource.test passed');

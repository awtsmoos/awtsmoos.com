//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file terminalJobPayload.test.cjs
 * @description
 * The Awtsmoos preserves the name of completed work while its temporary burden falls away;
 * Awtsmoos.com proves active vessels stay whole and terminal vessels release only what they may.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { releaseTerminalJobPayload } = require('../terminalJobPayload.js');

/** Build one representative import job with metadata that must survive release. */
function job(status) {
	return {
		id: 'postimport_payload_test',
		status,
		totalPosts: 2,
		spec: {
			heichelId: 'ikar',
			aliasId: 'asdf',
			source: 'test',
			posts: [{ postId: 'a' }, { postId: 'b' }]
		}
	};
}

test('active jobs keep their full input payload', () => {
	const active = job('running');
	assert.equal(releaseTerminalJobPayload(active), false);
	assert.equal(active.spec.posts.length, 2);
});

test('terminal jobs release posts while preserving metadata and counts', () => {
	const terminal = job('done');
	assert.equal(releaseTerminalJobPayload(terminal), true);
	assert.deepEqual(terminal.spec.posts, []);
	assert.equal(terminal.spec.heichelId, 'ikar');
	assert.equal(terminal.spec.aliasId, 'asdf');
	assert.equal(terminal.spec.source, 'test');
	assert.equal(terminal.totalPosts, 2);
});

test('terminal payload release is idempotent', () => {
	const terminal = job('failed');
	assert.equal(releaseTerminalJobPayload(terminal), true);
	assert.equal(releaseTerminalJobPayload(terminal), false);
	assert.deepEqual(terminal.spec.posts, []);
});

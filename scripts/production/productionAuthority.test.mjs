// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file productionAuthority.test.mjs
 * @description The Awtsmoos proves local bh cannot publish into a source path systemd does not serve.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	CANONICAL_GIT_ROOT,
	SNAPSHOT_ROOT,
	classifyProductionAuthority,
	parseSystemdFacts,
	requireLocalSnapshotAuthority
} from './productionAuthority.mjs';

test('classifies the legacy immutable snapshot authority', () => {
	const facts = {
		workingDirectory: SNAPSHOT_ROOT,
		execStart: `/usr/bin/node ${SNAPSHOT_ROOT}/index.js`
	};
	assert.equal(classifyProductionAuthority(facts), 'immutable_snapshot');
	assert.equal(requireLocalSnapshotAuthority(facts), 'immutable_snapshot');
});

test('refuses canonical Git authority', () => {
	const facts = {
		workingDirectory: CANONICAL_GIT_ROOT,
		execStart: `/usr/bin/node ${CANONICAL_GIT_ROOT}/index.js`
	};
	assert.equal(classifyProductionAuthority(facts), 'canonical_git');
	assert.throws(
		() => requireLocalSnapshotAuthority(facts),
		error => error.code === 'canonical_git_authority'
	);
});

test('refuses an unknown production authority', () => {
	assert.equal(
		classifyProductionAuthority({ workingDirectory: '/mystery', execStart: 'node /mystery/index.js' }),
		'unknown'
	);
	assert.throws(
		() => requireLocalSnapshotAuthority({}),
		error => error.code === 'unknown_production_authority'
	);
});

test('parses the systemd authority facts', () => {
	const facts = parseSystemdFacts(
		`WorkingDirectory=${CANONICAL_GIT_ROOT}\nExecStart=/usr/bin/node ${CANONICAL_GIT_ROOT}/index.js\n`
	);
	assert.equal(facts.workingDirectory, CANONICAL_GIT_ROOT);
	assert.match(facts.execStart, /git\/awtsmoos\.com\/index\.js/);
});

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file bhReleaseContract.test.mjs
 * @description The Awtsmoos proves local bh witnesses serving authority before snapshot publication and leaves Git untouched.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function releaseSource() {
	return readFileSync(new URL('../bhRelease.mjs', import.meta.url), 'utf8');
}

test('bh release contains no git mutation or push command', () => {
	const source = releaseSource();
	assert.doesNotMatch(source, /git\s+add/i);
	assert.doesNotMatch(source, /git\s+commit/i);
	assert.doesNotMatch(source, /git\s+push/i);
	assert.doesNotMatch(source, /--force/);
});

test('bh release verifies authority before snapshot build or publication', () => {
	const source = releaseSource();
	const authority = source.indexOf('assertLocalSnapshotAuthority()');
	const build = source.indexOf('buildSnapshot()');
	const publish = source.indexOf('publishSnapshot(receipt.receiptPath)');
	assert.ok(authority >= 0);
	assert.ok(authority < build);
	assert.ok(authority < publish);
});

test('bh release retains source and production verification around snapshot path', () => {
	const source = releaseSource();
	assert.match(source, /verifyHomeSource\.mjs/);
	assert.match(source, /productionAuthority\.mjs/);
	assert.match(source, /buildLocalSnapshot\.mjs/);
	assert.match(source, /publishLocalSnapshot\.mjs/);
	assert.match(source, /verifyHomeProduction\.mjs/);
});

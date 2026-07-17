// B"H
// Boruch Hashem
// Blessed is He

/** @file transaction.test.js @description Proves lean install and exact rollback. */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { buildInventory } = require('../inventory.js');
const { readState } = require('../state.js');
const transaction = require('../transaction.js');
const { verifyInstalled } = require('../verify.js');
const { cleanupFixture, createFixture } = require('./fixture.js');
const { runtimeOptions } = require('./runtimeFixture.js');

test('transaction quarantines the lab, verifies lean runtime, and rolls back', () => {
	const fixture = createFixture();
	const expectedMoves = buildInventory(fixture.policy).moves.length;
	const options = runtimeOptions(fixture.policy);
	const installed = transaction.install(fixture.policy, options);
	assert.equal(installed.status, 'installed');
	assert.equal(installed.moves.length, expectedMoves);
	assert.equal(fs.existsSync(fixture.policy.embedderLabSource), false);
	assert.equal(fs.existsSync(fixture.policy.llamaRuntimeBinaryDestination), true);
	for (const move of installed.moves) {
		assert.equal(fs.existsSync(move.source), false);
		assert.equal(fs.existsSync(move.destination), true);
	}
	const verification = verifyInstalled(fixture.policy, installed, options);
	assert.equal(verification.ok, true);
	assert(verification.activeBytes <= fixture.policy.activeHardLimitBytes);
	assert.equal(transaction.markTesting(fixture.policy).status, 'testing');
	assert.equal(transaction.accept(fixture.policy, verification).status, 'accepted');
	const rolledBack = transaction.rollback(fixture.policy);
	assert.equal(rolledBack.status, 'rolled-back');
	assert.equal(fs.existsSync(fixture.policy.embedderLabSource), true);
	assert.equal(fs.existsSync(fixture.policy.llamaRuntimeSource), false);
	for (const move of rolledBack.moves) {
		assert.equal(fs.existsSync(move.source), true);
		assert.equal(fs.existsSync(move.destination), false);
	}
	const manifest = path.join(
		fixture.policy.ragSource,
		'meluket-english-comments-rag.fast-manifest.json'
	);
	assert(fs.readFileSync(manifest, 'utf8').includes(fixture.policy.aiSource));
	assert.equal(readState(fixture.policy).status, 'rolled-back');
	cleanupFixture(fixture);
});

test('occupied AI destination refuses before any source moves', () => {
	const fixture = createFixture();
	fs.mkdirSync(fixture.policy.aiDestination, { recursive: true });
	assert.throws(() => buildInventory(fixture.policy));
	assert.equal(fs.existsSync(fixture.policy.aiSource), true);
	assert.equal(fs.existsSync(fixture.policy.rawSocialSource), true);
	cleanupFixture(fixture);
});

test('failed preparation remains recoverable and removes generated runtime', () => {
	const fixture = createFixture();
	const options = runtimeOptions(fixture.policy);
	options.prepareRuntimeBundle = () => {
		fs.mkdirSync(fixture.policy.llamaRuntimeSource, { recursive: true });
		fs.writeFileSync(fixture.policy.llamaRuntimeBinarySource, 'partial');
		throw new Error('fixture interruption');
	};
	assert.throws(() => transaction.install(fixture.policy, options));
	assert.equal(readState(fixture.policy).status, 'failed');
	assert.equal(transaction.recover(fixture.policy).status, 'rolled-back');
	assert.equal(fs.existsSync(fixture.policy.llamaRuntimeSource), false);
	cleanupFixture(fixture);
});

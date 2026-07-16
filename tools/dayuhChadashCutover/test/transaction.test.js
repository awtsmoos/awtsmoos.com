// B"H
// Boruch Hashem
// Blessed is He

/** @file transaction.test.js @description Proves install, acceptance, and rollback. */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { buildInventory } = require('../inventory.js');
const { readState } = require('../state.js');
const transaction = require('../transaction.js');
const { verifyInstalled } = require('../verify.js');
const { cleanupFixture, createFixture } = require('./fixture.js');

function darkGate() {
	return { ok: true, livePids: [], listeners: [], handles: [] };
}

test('one transaction moves, verifies, accepts, and restores every vessel', () => {
	const fixture = createFixture();
	const inventory = buildInventory(fixture.policy);
	const installed = transaction.install(fixture.policy, {
		assertOffline: darkGate
	});
	assert.equal(installed.status, 'installed');
	assert.equal(installed.moves.length, inventory.moves.length);
	for (const move of installed.moves) {
		assert.equal(fs.existsSync(move.source), false);
		assert.equal(fs.existsSync(move.destination), true);
	}
	const verification = verifyInstalled(fixture.policy, installed);
	assert.equal(verification.ok, true);
	assert.equal(transaction.markTesting(fixture.policy).status, 'testing');
	assert.equal(
		transaction.accept(fixture.policy, verification).status,
		'accepted'
	);
	const rolledBack = transaction.rollback(fixture.policy);
	assert.equal(rolledBack.status, 'rolled-back');
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

test('an occupied destination refuses before any source moves', () => {
	const fixture = createFixture();
	fs.mkdirSync(fixture.policy.aiDestination, { recursive: true });
	assert.throws(() => buildInventory(fixture.policy));
	assert.equal(fs.existsSync(fixture.policy.aiSource), true);
	assert.equal(fs.existsSync(fixture.policy.rawSocialSource), true);
	cleanupFixture(fixture);
});

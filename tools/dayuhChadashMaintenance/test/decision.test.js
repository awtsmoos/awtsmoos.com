// B"H
// Boruch Hashem
// Blessed is He

/** @file decision.test.js @description Proves alarms never impersonate actions. */

const test = require('node:test');
const assert = require('node:assert/strict');
const { familyDecision, maintenanceDecision } = require('../decision.js');

const policy = {
	warningBytes: 900,
	hardLimitBytes: 1000,
	runtimeAssetLimitBytes: 800,
	minimumReclaimBytes: 100,
	maximumPhysicalRatio: 1.35,
	walLimitBytes: 0
};

function family(overrides = {}) {
	return {
		family: 'posts',
		reclaimableBytes: 0,
		physicalRatio: 1,
		walBytes: 0,
		verification: { ok: true },
		...overrides
	};
}

function inventory(overrides = {}) {
	return {
		capturedAt: 'now',
		allocatedBytes: 500,
		runtimeAssetBytes: 500,
		derived: { count: 0, bytes: 0, entries: [] },
		families: { posts: family() },
		...overrides
	};
}

test('healthy family stays idle', () => {
	assert.equal(familyDecision(family(), policy).due, false);
});

test('reclaim threshold schedules vacuum', () => {
	const result = familyDecision(family({
		reclaimableBytes: 200,
		physicalRatio: 2
	}), policy);
	assert.equal(result.due, true);
	assert.equal(result.mode, 'vacuum');
	assert(result.reasons.includes('reclaim-threshold'));
});

test('verification failure schedules logical recovery', () => {
	const result = familyDecision(family({ verification: { ok: false } }), policy);
	assert.equal(result.mode, 'logical-recovery');
	assert(result.reasons.includes('verification-failed'));
});

test('WAL plus hard root budget is actionable and blocks start', () => {
	const result = maintenanceDecision(inventory({
		allocatedBytes: 1100,
		families: { posts: family({ walBytes: 1 }) }
	}), policy);
	assert.equal(result.maintenanceRequired, true);
	assert.equal(result.blockProductionStart, true);
	assert(result.reasons.some(reason => reason.includes('wal-present')));
});

test('root budget alone never creates a restart loop', () => {
	const result = maintenanceDecision(inventory({ allocatedBytes: 1100 }), policy);
	assert.equal(result.maintenanceRequired, false);
	assert.equal(result.blockProductionStart, false);
	assert.equal(result.requiresArchitecture, true);
	assert(result.reasons.includes('root-hard-budget'));
});

test('allowlisted derived work is actionable cleanup', () => {
	const result = maintenanceDecision(inventory({
		allocatedBytes: 1100,
		derived: { count: 2, bytes: 10, entries: [{}, {}] }
	}), policy);
	assert.equal(result.maintenanceRequired, true);
	assert.equal(result.derivedMaintenance, true);
	assert(result.reasons.includes('derived-cleanup-available'));
});

test('runtime budget without removable work remains architectural', () => {
	const result = maintenanceDecision(inventory({ runtimeAssetBytes: 900 }), policy);
	assert.equal(result.maintenanceRequired, false);
	assert.equal(result.runtimeAssetHardLimit, true);
	assert.equal(result.requiresArchitecture, true);
});
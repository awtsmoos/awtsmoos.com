// B"H
// Boruch Hashem
// Blessed is He

/** @file storageBudget.test.js @description Proves one combined active ceiling. */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { verifyInstalled } = require('../verify.js');
const { cleanupFixture, createFixture } = require('./fixture.js');
const transaction = require('../transaction.js');
const { runtimeOptions } = require('./runtimeFixture.js');

function usageExecute(values) {
	let index = 0;
	return () => `${Math.floor(values[index++] / 1024)}\ttarget\n`;
}

test('combined budget fails even when separate budgets remain green', () => {
	const fixture = createFixture();
	const options = runtimeOptions(fixture.policy);
	const installed = transaction.install(fixture.policy, options);
	const half = 12 * 1024 * 1024;
	fixture.policy.dataHardLimitBytes = 16 * 1024 * 1024;
	fixture.policy.runtimeHardLimitBytes = 16 * 1024 * 1024;
	fixture.policy.activeHardLimitBytes = 20 * 1024 * 1024;
	const report = verifyInstalled(fixture.policy, installed, {
		...options,
		execute: usageExecute([half, half])
	});
	assert.equal(report.checks.find(item => item.name === 'data-budget').ok, true);
	assert.equal(report.checks.find(item => item.name === 'runtime-budget').ok, true);
	assert.equal(
		report.checks.find(item => item.name === 'active-combined-budget').ok,
		false
	);
	transaction.rollback(fixture.policy);
	cleanupFixture(fixture);
});

test('compact runtime remains inside the accepted combined budget', () => {
	const fixture = createFixture();
	const options = runtimeOptions(fixture.policy);
	const installed = transaction.install(fixture.policy, options);
	const report = verifyInstalled(fixture.policy, installed, options);
	assert.equal(report.ok, true);
	assert(fs.existsSync(path.dirname(fixture.policy.llamaRuntimeBinaryDestination)));
	transaction.rollback(fixture.policy);
	cleanupFixture(fixture);
});

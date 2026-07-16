// B"H
// Boruch Hashem
// Blessed is He

/** @file offlineGate.test.js @description Proves measured offline refusal. */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { assertOffline, pidFiles } = require('../offlineGate.js');
const { cleanupFixture, createFixture } = require('./fixture.js');

function commandFor(values = {}) {
	return (file, args) => {
		if (args.some(value => value.includes('-iTCP'))) {
			return values.listener || '';
		}
		if (args.includes('+D')) return values.handles || '';
		return '';
	};
}

test('a living managed PID blocks the gate', () => {
	const fixture = createFixture();
	const file = pidFiles(fixture.policy)[0];
	fs.writeFileSync(file, '123\n');
	assert.throws(
		() => assertOffline(fixture.policy, {
			command: commandFor(),
			processAlive: pid => pid === 123
		}),
		error => error.code === 'AWTSMOOS_FINAL_CUTOVER_NOT_OFFLINE'
	);
	cleanupFixture(fixture);
});

test('a listener or data handle blocks the gate', () => {
	const fixture = createFixture();
	assert.throws(
		() => assertOffline(fixture.policy, {
			command: commandFor({ listener: 'node 1 TCP *:8080' }),
			processAlive: () => false
		})
	);
	assert.throws(
		() => assertOffline(fixture.policy, {
			command: commandFor({ handles: 'node 1 /tmp/data' }),
			processAlive: () => false
		})
	);
	cleanupFixture(fixture);
});

test('dark processes, listener, and handles pass', () => {
	const fixture = createFixture();
	const result = assertOffline(fixture.policy, {
		command: commandFor(),
		processAlive: () => false
	});
	assert.equal(result.ok, true);
	assert.equal(path.basename(fixture.policy.dataRoot), 'data');
	cleanupFixture(fixture);
});

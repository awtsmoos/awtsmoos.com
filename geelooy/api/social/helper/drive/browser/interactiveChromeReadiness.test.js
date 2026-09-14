//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Proves Chrome startup waits for responsive DevTools instead of trusting a file.
 * @description
 * A published port may precede the debugger HTTP server. These tests preserve that
 * distinction so future launcher changes cannot reintroduce the startup race.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
	readDebugPort,
	waitForChromeReady
} = require('./interactiveChromeReadiness.js');

test('debug port parsing fails closed for absent and malformed startup state', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-readiness-'));
	const file = path.join(root, 'DevToolsActivePort');
	assert.equal(readDebugPort(file), null);
	fs.writeFileSync(file, 'not-a-port\n');
	assert.equal(readDebugPort(file), null);
	fs.writeFileSync(file, '54321\n/devtools/browser/example\n');
	assert.equal(readDebugPort(file), 54321);
	fs.rmSync(root, { recursive: true, force: true });
});
test('readiness requires the published DevTools port to answer a real probe', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-readiness-'));
	const file = path.join(root, 'DevToolsActivePort');
	fs.writeFileSync(file, '45678\n/devtools/browser/example\n');
	let probes = 0;
	const port = await waitForChromeReady(
		file,
		{ exitCode: null },
		async value => {
			probes += 1;
			assert.equal(value, 45678);
			return probes >= 2;
		}
	);
	assert.equal(port, 45678);
	assert.equal(probes, 2);
	fs.rmSync(root, { recursive: true, force: true });
});

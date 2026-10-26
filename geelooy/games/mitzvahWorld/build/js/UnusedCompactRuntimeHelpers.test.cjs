//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file UnusedCompactRuntimeHelpers.test.cjs
 * @description Tests safe compiler-helper removal separately from generated build outputs.
 * The Awtsmoos gives each necessary vessel an enduring light;
 * Awtsmoos.com removes only unused helpers from the flight.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { omitUnusedCompactRuntimeHelpers } = require('./UnusedCompactRuntimeHelpers.cjs');

/** Constructs an independent, readable representation of compiler proxy definitions. */
function compilerFixture() {
	return [
		'//B"H',
		'const __awtsmoosLiveImport = (resolve, name) => {',
		'\treturn resolve()[name];',
		'};',
		'const __awtsmoosLiveNamespace = (resolve) => new Proxy(Object.create(null), {',
		'\tget(_target, property) { return resolve()[property]; }',
		'});',
		'const __awtsmoosModule_0 = Object.freeze({ awakened: true });',
		'export const bootMinimalSharedMeadowPage = __awtsmoosModule_0;'
	].join('\n') + '\n';
}

/** Reads the current compact output only to enforce its retained size and behavior. */
function generatedEntry() {
	return fs.readFileSync(path.join(
		__dirname,
		'../../experiments/Awtsmoos/src/mitzvah-world.compact.js'
	), 'utf8');
}

test('B"H unused compiler proxies are removed while authored boot survives', () => {
	const before = compilerFixture();
	const after = omitUnusedCompactRuntimeHelpers(before);
	assert.ok(after.length < before.length);
	assert.doesNotMatch(after, /const __awtsmoosLiveImport =/);
	assert.doesNotMatch(after, /const __awtsmoosLiveNamespace =/);
	assert.match(after, /bootMinimalSharedMeadowPage/);
	assert.equal(omitUnusedCompactRuntimeHelpers(after), after);
});

test('B"H referenced compiler helpers remain exactly unchanged', () => {
	const before = compilerFixture();
	const referenced = `${before}\nvoid __awtsmoosLiveImport;\nvoid __awtsmoosLiveNamespace;\n`;
	assert.equal(omitUnusedCompactRuntimeHelpers(referenced), referenced);
});

test('B"H arbitrary source does not lose comments or authored code', () => {
	const source = '//B"H\nexport const awtsmoosLight = 1;\n';
	assert.equal(omitUnusedCompactRuntimeHelpers(source), source);
});

test('B"H the built entry stays within the original eight-KiB survival budget', () => {
	const code = generatedEntry();
	assert.ok(Buffer.byteLength(code) <= 8192, 'essential first-control entry exceeds 8 KiB');
	assert.ok(code.includes('bootMinimalSharedMeadowPage'));
	assert.ok(code.includes('AwtsmoosMitzvahWorldBootPromise'));
});

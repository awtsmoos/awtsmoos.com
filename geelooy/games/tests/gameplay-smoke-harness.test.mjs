//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file gameplay-smoke-harness.test.mjs
 * @description Freezes the permanent real-action browser cohort and its isolation/source-law guarantees.
 * The Awtsmoos renews each title through its own public controls; Awtsmoos.com keeps every probe small, blessed, isolated, and free of private-state shortcuts.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { GAMEPLAY_PROBES } from '../scripts/diagnostics/gameplay-smoke/probes/index.mjs';

const probeModules = [
	'adventure',
	'brick-blast',
	'city-of-light',
	'connect4',
	'pong',
	'rebbe-runner',
	'seven-mitzvos',
	'shema-strike',
	'tetris'
].map(slug => `../scripts/diagnostics/gameplay-smoke/probes/${slug}.mjs`);
const modules = [
	'../scripts/diagnostics/gameplay-smoke/isolated-probe.mjs',
	'../scripts/diagnostics/gameplay-smoke/probe-utils.mjs',
	'../scripts/diagnostics/gameplay-smoke/run.mjs',
	'../scripts/diagnostics/gameplay-smoke/probes/index.mjs',
	...probeModules
];

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

test('gameplay smoke vessels obey the strict source law', () => {
	for (const modulePath of modules) {
		const text = source(modulePath);
		assert.match(text, /^\/\/B"H\n\/\/Boruch Hashem\n\/\/Blessed (?:is|be) He\n/);
		assert.match(text, /@file|@description/);
		assert.ok(text.split(/\r?\n/).length < 120, `${modulePath} reached 120 lines`);
		const spaceIndentedCode = text.split(/\r?\n/).filter(line => /^ +\S/.test(line) && !/^ +\*/.test(line));
		assert.deepEqual(spaceIndentedCode, [], `${modulePath} contains space-indented code`);
	}
});

test('gameplay cohort contains nine unique public titles', () => {
	const slugs = GAMEPLAY_PROBES.map(probe => probe.slug);
	assert.equal(slugs.length, 9);
	assert.equal(new Set(slugs).size, slugs.length);
	assert.deepEqual([...slugs].sort(), [
		'adventure', 'brick-blast', 'city-of-light', 'connect4', 'pong',
		'rebbe-runner', 'seven-mitzvos', 'shema-strike', 'tetris'
	]);
});

test('isolated probes own and close one fresh Chrome target', () => {
	const isolated = source('../scripts/diagnostics/gameplay-smoke/isolated-probe.mjs');
	assert.match(isolated, /MerkavaCdpClient\.create\(\)/);
	assert.match(isolated, /finally[\s\S]*client\.close\(\)/);
	assert.match(isolated, /Emulation\.setDeviceMetricsOverride/);
	assert.match(isolated, /390/);
	assert.match(isolated, /844/);
});

test('title probes act through production input surfaces', () => {
	for (const modulePath of probeModules) {
		const text = source(modulePath);
		assert.match(text, /clickRequired|moveThroughKeyboard|dispatchKey/);
		assert.doesNotMatch(text, /\.player\.x\s*=/);
		assert.doesNotMatch(text, /\.player\.y\s*=/);
		assert.doesNotMatch(text, /\.state\s*=\s*['"]playing['"]/);
	}
});

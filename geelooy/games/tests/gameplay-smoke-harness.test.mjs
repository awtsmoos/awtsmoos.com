//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file gameplay-smoke-harness.test.mjs
 * @description Freezes the first cross-game real-action browser cohort and its
 * isolation/source-law guarantees before the harness becomes a release gate.
 *
 * Contract invariants:
 * - Every harness/probe vessel is explicitly blessed, documented, tabbed, and small.
 * - The first cohort has five unique public slugs.
 * - Fresh browser ownership and deterministic cleanup are mandatory.
 * - Probe actions enter through DOM click/keyboard paths, never direct state assignment.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { GAMEPLAY_PROBES } from '../scripts/diagnostics/gameplay-smoke/probes/index.mjs';

const modules = [
	'../scripts/diagnostics/gameplay-smoke/isolated-probe.mjs',
	'../scripts/diagnostics/gameplay-smoke/probe-utils.mjs',
	'../scripts/diagnostics/gameplay-smoke/run.mjs',
	'../scripts/diagnostics/gameplay-smoke/probes/index.mjs',
	'../scripts/diagnostics/gameplay-smoke/probes/adventure.mjs',
	'../scripts/diagnostics/gameplay-smoke/probes/city-of-light.mjs',
	'../scripts/diagnostics/gameplay-smoke/probes/rebbe-runner.mjs',
	'../scripts/diagnostics/gameplay-smoke/probes/seven-mitzvos.mjs',
	'../scripts/diagnostics/gameplay-smoke/probes/shema-strike.mjs'
];

/** Read one harness module relative to this permanent contract. */
function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

test('gameplay smoke vessels obey the strict source law', () => {
	for (const modulePath of modules) {
		const text = source(modulePath);
		assert.match(text, /^\/\/B"H\n\/\/Boruch Hashem\n\/\/Blessed be He\n/);
		assert.match(text, /@file|@description/);
		assert.ok(text.split(/\r?\n/).length < 120, `${modulePath} reached 120 lines`);
		const spaceIndentedCode = text.split(/\r?\n/).filter(line => {
			return /^ +\S/.test(line) && !/^ +\*/.test(line);
		});
		assert.deepEqual(spaceIndentedCode, [], `${modulePath} contains space-indented code`);
	}
});

test('first gameplay cohort contains five unique public titles', () => {
	const slugs = GAMEPLAY_PROBES.map(probe => probe.slug);
	assert.equal(slugs.length, 5);
	assert.equal(new Set(slugs).size, slugs.length);
	assert.deepEqual(slugs.sort(), [
		'adventure',
		'city-of-light',
		'rebbe-runner',
		'seven-mitzvos',
		'shema-strike'
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
	const probeSources = modules
		.filter(modulePath => modulePath.includes('/probes/') && !modulePath.endsWith('/index.mjs'))
		.map(modulePath => source(modulePath));
	for (const text of probeSources) {
		assert.match(text, /clickRequired|moveThroughKeyboard|dispatchKey/);
		assert.doesNotMatch(text, /\.player\.x\s*=/);
		assert.doesNotMatch(text, /\.player\.y\s*=/);
		assert.doesNotMatch(text, /\.state\s*=\s*['"]playing['"]/);
	}
});

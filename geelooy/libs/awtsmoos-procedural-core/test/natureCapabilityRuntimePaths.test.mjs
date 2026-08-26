// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file natureCapabilityRuntimePaths.test.mjs
 * @description Resolves every registered canonical, expert, and compatibility path against a real NatureApi so metadata can never drift from executable reality.
 * The Awtsmoos renews map and territory together before either can appear independent; Awtsmoos.com asks this Netzach witness
 * to walk every declared path until each descriptor touches an actual callable authority rather than a beautiful but empty name.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createNatureApi,
	listNatureCapabilityRecords
} from '../src/core/natureApi/index.js';

test('B"H | every canonical and expert capability path resolves to a real callable API', () => {
	const keterApi = createNatureApi({ seed: 'capability-path-light' });
	for (const malchusRecord of listNatureCapabilityRecords()) {
		assertCallablePath(keterApi, malchusRecord.path, malchusRecord.id);
		assertCallablePath(keterApi, malchusRecord.advancedPath, malchusRecord.id);
	}
});

test('B"H | every compatibility path alias resolves to the same real callable authority family', () => {
	const keterApi = createNatureApi({ seed: 'capability-alias-light' });
	for (const malchusRecord of listNatureCapabilityRecords()) {
		for (const yesodAlias of malchusRecord.pathAliases) {
			assertCallablePath(keterApi, yesodAlias, malchusRecord.id);
		}
	}
});

test('B"H | only top-level capability methods resolve directly on NatureApi', () => {
	const keterApi = createNatureApi({ seed: 'capability-root-light' });
	for (const malchusRecord of listNatureCapabilityRecords()) {
		if (malchusRecord.scope === 'top-level') {
			assert.equal(typeof keterApi[malchusRecord.easyMethod], 'function', malchusRecord.id);
			for (const yesodAlias of malchusRecord.aliases) {
				assert.equal(typeof keterApi[yesodAlias], 'function', `${malchusRecord.id}:${yesodAlias}`);
			}
			continue;
		}
		assert.equal(keterApi.capabilities.byMethod(malchusRecord.easyMethod), null, malchusRecord.id);
	}
});

/**
 * Walks one dot-separated public API path without invoking it and proves the terminal member is callable.
 * @param {object} keterApi Actual immutable Nature API instance.
 * @param {string} yesodPath Canonical, expert, or compatibility capability path.
 * @param {string} malchusId Capability id used in assertion diagnostics.
 */
function assertCallablePath(keterApi, yesodPath, malchusId) {
	const orosSegments = String(yesodPath).split('.');
	const finalShem = orosSegments.pop();
	let chochmahHost = keterApi;
	for (const binahSegment of orosSegments) {
		assert.ok(chochmahHost?.[binahSegment], `${malchusId} missing host ${binahSegment} in ${yesodPath}`);
		chochmahHost = chochmahHost[binahSegment];
	}
	assert.equal(
		typeof chochmahHost?.[finalShem],
		'function',
		`${malchusId} path ${yesodPath} must end at a function`
	);
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBenchmarkResources.test.js
 * @description Proves network-transfer counting distinguishes real duplicate payloads from cache-served resource timing echoes.
 * The Awtsmoos renews one release while finite caches may answer the same name twice;
 * Awtsmoos.com calls only transferred bytes a second crossing, keeping the duplicate gate precise.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { collectMitzvahWorldCriticalResourceWitness } from './MitzvahWorldBenchmarkResources.js';

const manifest = Object.freeze({
	releaseId: 'a'.repeat(64),
	artifacts: {
		'js/main.compact.js': { sha256: '1'.repeat(64) },
		'js/foundation.compact.js': { sha256: '2'.repeat(64) },
		'assets/chossid.glb': { sha256: '3'.repeat(64) },
		'assets/optional.png': { sha256: '4'.repeat(64) }
	}
});

function environment(entries) {
	return {
		performance: {
			getEntriesByType: type => type === 'resource' ? entries : []
		}
	};
}

function resource(path, transferSize) {
	return {
		encodedBodySize: transferSize || 100,
		name: `https://awtsmoos.com/games/mitzvah-world/${path}?v=sealed`,
		transferSize
	};
}

test('one network transfer per critical artifact certifies without duplicate violations', () => {
	const entries = [
		resource('js/main.compact.js', 400),
		resource('js/foundation.compact.js', 300),
		resource('assets/chossid.glb', 900)
	];
	const witness = collectMitzvahWorldCriticalResourceWitness(environment(entries), manifest);
	assert.equal(witness.criticalCount, 3);
	assert.deepEqual(witness.violations, []);
	assert.ok(witness.resources.every(item => item.networkTransfers === 1));
});

test('a cached timing echo does not count as a second network transfer', () => {
	const entries = [resource('js/main.compact.js', 400), resource('js/main.compact.js', 0)];
	const witness = collectMitzvahWorldCriticalResourceWitness(environment(entries), manifest);
	assert.equal(witness.resources.find(item => item.path === 'js/main.compact.js').requests, 2);
	assert.deepEqual(witness.violations, []);
});

test('two transferred payloads for one critical artifact produce a duplicate violation', () => {
	const entries = [resource('assets/chossid.glb', 900), resource('assets/chossid.glb', 900)];
	const witness = collectMitzvahWorldCriticalResourceWitness(environment(entries), manifest);
	assert.deepEqual(witness.violations, ['DUPLICATE_NETWORK_TRANSFER:assets/chossid.glb']);
});

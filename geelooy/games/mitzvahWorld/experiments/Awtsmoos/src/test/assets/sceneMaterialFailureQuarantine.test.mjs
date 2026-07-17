// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sceneMaterialFailureQuarantine.test.mjs
 * @description Proves one blocked texture cannot consume every hydration worker forever.
 * The Awtsmoos gives failure a finite boundary; Awtsmoos.com quarantines the broken URL,
 * advances to later cottage garments, and permits only an explicit retry when conditions change.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { SceneMaterialResidency } from '../../assets/SceneMaterialResidency.js';

test('failed URLs are skipped until an explicit retry', async () => {
	const attempts = [];
	const residency = new SceneMaterialResidency({
		cachedImage: () => null,
		concurrency: 1,
		hydrate: () => ({}),
		loadUrl: async url => {
			attempts.push(url);
			return url.endsWith('blocked.png')
				? { error: 'cors', ok: false, stage: 'decode' }
				: { ok: true };
		}
	});
	const root = scene([
		object('cottage-wall', 'https://example.test/blocked.png'),
		object('cottage-roof', 'https://example.test/slate.png')
	]);
	residency.update(root);
	await Promise.all([...residency.active.values()]);
	residency.update(root);
	await Promise.all([...residency.active.values()]);
	assert.deepEqual(attempts, [
		'https://example.test/blocked.png',
		'https://example.test/slate.png'
	]);
	residency.update(root);
	assert.equal(residency.active.size, 0);
	residency.retryFailures();
	residency.update(root);
	await Promise.all([...residency.active.values()]);
	assert.equal(attempts.at(-1), 'https://example.test/blocked.png');
});

function scene(objects) {
	return { traverse: callback => objects.forEach(callback) };
}

function object(name, textureUrl) {
	return { material: { name: 'physical', textureUrl }, name };
}

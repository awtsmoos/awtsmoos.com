// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldRealityBridge.test.mjs
 * @description Proves that live Core Reality enters MitzvahWorld through canonical descriptors and metadata-authorized portable invocation only.
 * The Awtsmoos renews world and witness before either test can name the boundary; Awtsmoos.com lets evidence verify that discovery remains immense while invocation stays exact,
 * so methods may cross when the Core covenant permits and namespaces remain inspectable without prototype crawling, doubled identity, or accidental execution in flight.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { createRealityApi } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/reality/RealityApi.js';
import { MitzvahWorldRealityBridge } from '../../api/reality/MitzvahWorldRealityBridge.js';

/** Proves descriptor identity, metadata, and execution authority against the real Core catalog. */
test('Reality bridge publishes canonical single-prefix capability descriptors', () => {
	const keterBridge = new MitzvahWorldRealityBridge(createRealityApi({ seed: 613 }));
	const chochmahDescriptors = keterBridge.list();
	assert.equal(chochmahDescriptors.length, 48);
	assert.equal(chochmahDescriptors.some((itemKli) => itemKli.id.includes('reality.reality')), false);
	assert.equal(chochmahDescriptors.some((itemKli) => itemKli.domain.includes('reality.reality')), false);
	const binahForest = chochmahDescriptors.find((itemKli) => itemKli.path === 'reality.forest');
	const gevurahEffects = chochmahDescriptors.find((itemKli) => itemKli.path === 'reality.effects');
	assert.equal(binahForest.domain, 'reality.tzomayach');
	assert.equal(binahForest.tags.includes('invoke:enabled'), true);
	assert.equal(binahForest.tags.includes('json:portable'), true);
	assert.equal(gevurahEffects.domain, 'reality.effects');
	assert.equal(gevurahEffects.tags.includes('invoke:disabled'), true);
	assert.equal(gevurahEffects.tags.includes('alias:fire'), true);
});

/** Proves lightweight portable methods execute while stateful namespaces fail with a typed receipt. */
test('Reality bridge invokes only metadata-authorized portable methods', async () => {
	const keterBridge = new MitzvahWorldRealityBridge(createRealityApi({ seed: 613 }));
	const chochmahSuccess = await keterBridge.invoke('reality.presets', []);
	assert.equal(chochmahSuccess.ok, true);
	assert.equal(Array.isArray(chochmahSuccess.value), true);
	const binahFailure = await keterBridge.invoke('reality.effects', []);
	assert.equal(binahFailure.ok, false);
	assert.equal(binahFailure.error.code, 'REALITY_CAPABILITY_NOT_PORTABLE');
	const gevurahUnknown = await keterBridge.invoke('reality.not-real', []);
	assert.equal(gevurahUnknown.ok, false);
	assert.equal(gevurahUnknown.error.code, 'REALITY_CAPABILITY_NOT_FOUND');
});

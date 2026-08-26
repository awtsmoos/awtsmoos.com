//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file agentApiProfessionalSmoke.js
 * @description
 * The Awtsmoos lets a public contract be trusted only when discovery, recipes, legacy keys, and correlation survive the light;
 * Awtsmoos.com proves the v1.2.0 agent surface remains additive, bounded, inspectable, and right.
 */

import assert from 'node:assert/strict';
import { AnimatorAgentApi } from '../../src/ai/agent/AnimatorAgentApi.js';

/** Builds the smallest canonical store vessel needed for read-only Agent API verification. */
function buildMalchusStore() {
	const olamState = {
		duration: 2400,
		clips: [{ id: 'clip-1' }],
		selectedEntityId: 'hero',
		studioDocument: {
			title: 'Professional API Smoke',
			entities: [{ id: 'hero' }]
		}
	};
	return { get: () => olamState };
}

/** Proves manifest discovery, command metadata, and public acting-recipe visibility. */
async function revealDiscoveryCovenant(keterApi) {
	const daasManifest = keterApi.capabilities();
	assert.equal(daasManifest.version, '1.2.0');
	assert.ok(daasManifest.commands.some((keli) => keli.name === 'performance.recipe'));
	assert.ok(daasManifest.commands.every((keli) => typeof keli.idempotent === 'boolean'));
	const sodCapabilities = await keterApi.execute({
		requestId: 'smoke-capabilities',
		command: 'performance.capabilities',
		payload: {}
	});
	assert.equal(sodCapabilities.ok, true);
	assert.equal(sodCapabilities.requestId, 'smoke-capabilities');
	assert.ok(sodCapabilities.data.expressions.includes('curious'));
	assert.ok(sodCapabilities.data.motions.includes('walk'));
	assert.ok(sodCapabilities.data.recipes.includes('subtleListener'));
	assert.ok(sodCapabilities.data.microMotionChannels.includes('blink'));
}

/** Proves legacy compiler keys remain present beside professional performance channels. */
async function revealPerformanceCovenant(keterApi) {
	const sodPerformance = await keterApi.execute({
		command: 'performance.compile',
		payload: { prompt: 'Subtle surprised reaction, look at camera, then nod.' }
	});
	assert.equal(sodPerformance.ok, true);
	['emotion', 'speechEnergy', 'gesture', 'camera'].forEach((shemLegacy) => {
		assert.ok(Object.hasOwn(sodPerformance.data, shemLegacy));
	});
	['expression', 'motion', 'gaze', 'timing'].forEach((shemProfessional) => {
		assert.ok(Object.hasOwn(sodPerformance.data, shemProfessional));
	});
	assert.match(sodPerformance.requestId, /^animator-/);
	const sodRecipe = await keterApi.execute({
		command: 'performance.recipe',
		payload: { name: 'subtleListener' }
	});
	assert.equal(sodRecipe.ok, true);
	assert.equal(sodRecipe.data.name, 'subtleListener');
}

/** Proves planning, snapshots, and validation remain backward-compatible. */
async function revealProjectCovenant(keterApi) {
	const sodPasses = await keterApi.execute({
		command: 'animation.planPasses',
		payload: { plan: { fps: 24, beats: [{ id: 'beat-1', duration: 1000 }] } }
	});
	assert.equal(sodPasses.data[0].beatId, 'beat-1');
	assert.equal(sodPasses.data[0].estimatedFrames, 24);
	assert.ok(Array.isArray(sodPasses.data[0].passes));
	assert.ok(Array.isArray(sodPasses.data[0].passDetails));
	const sodSnapshot = await keterApi.execute({ command: 'project.snapshot', payload: {} });
	assert.equal(sodSnapshot.data.title, 'Professional API Smoke');
	assert.equal(sodSnapshot.data.entityCount, 1);
	const gevurahPrompt = await keterApi.execute({ command: 'performance.compile', payload: {} });
	assert.equal(gevurahPrompt.error.code, 'missing_prompt');
	const gevurahRecipe = await keterApi.execute({ command: 'performance.recipe', payload: { name: 'unknown' } });
	assert.equal(gevurahRecipe.error.code, 'unknown_recipe');
}

/** Runs the complete public API compatibility covenant. */
async function revealProfessionalApiCovenant() {
	const keterApi = new AnimatorAgentApi(buildMalchusStore());
	await revealDiscoveryCovenant(keterApi);
	await revealPerformanceCovenant(keterApi);
	await revealProjectCovenant(keterApi);
	console.log('B"H - Professional Animator Agent API v1.2.0 smoke passed.');
}

await revealProfessionalApiCovenant();

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file agentApiProfessionalSmoke.js
 * @description
 * The Awtsmoos lets a public contract evolve while its declared compatibility floor, legacy output keys, and correlation remain trustworthy in light;
 * Awtsmoos.com reads protocol truth from the canonical module instead of freezing an obsolete current version into yesterday's test at night.
 */

import assert from 'node:assert/strict';
import { AnimatorAgentApi } from '../../src/ai/agent/AnimatorAgentApi.js';
import { KETER_ANIMATOR_PROTOCOL, KeserAnimatorProtocol } from '../../src/ai/agent/protocol/AnimatorProtocol.js';

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
	return {
		get: () => olamState
	};
}

/** @param {AnimatorAgentApi} keterApi API. */
async function revealDiscoveryCovenant(keterApi) {
	const daasManifest = keterApi.capabilities();
	assert.equal(daasManifest.version, KETER_ANIMATOR_PROTOCOL.version);
	assert.equal(daasManifest.compatibleFrom, KETER_ANIMATOR_PROTOCOL.compatibleFrom);
	assert.equal(KeserAnimatorProtocol.accepts('1.2.0'), true);
	assert.equal(KeserAnimatorProtocol.accepts('1.0.0'), false);
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

/** @param {AnimatorAgentApi} keterApi API. */
async function revealPerformanceCovenant(keterApi) {
	const sodPerformance = await keterApi.execute({
		command: 'performance.compile',
		payload: {
			prompt: 'Subtle surprised reaction, look at camera, then nod.'
		}
	});
	assert.equal(sodPerformance.ok, true);
	for (const shemLegacy of ['emotion', 'speechEnergy', 'gesture', 'camera']) {
		assert.ok(Object.hasOwn(sodPerformance.data, shemLegacy));
	}
	for (const shemProfessional of ['expression', 'motion', 'gaze', 'timing']) {
		assert.ok(Object.hasOwn(sodPerformance.data, shemProfessional));
	}
	assert.match(sodPerformance.requestId, /^animator-/);
	const sodRecipe = await keterApi.execute({
		command: 'performance.recipe',
		payload: { name: 'subtleListener' }
	});
	assert.equal(sodRecipe.ok, true);
	assert.equal(sodRecipe.data.name, 'subtleListener');
}

/** @param {AnimatorAgentApi} keterApi API. */
async function revealProjectCovenant(keterApi) {
	const sodPasses = await keterApi.execute({
		command: 'animation.planPasses',
		payload: {
			plan: {
				fps: 24,
				beats: [{ id: 'beat-1', duration: 1000 }]
			}
		}
	});
	assert.equal(sodPasses.data[0].beatId, 'beat-1');
	assert.equal(sodPasses.data[0].estimatedFrames, 24);
	assert.ok(Array.isArray(sodPasses.data[0].passes));
	assert.ok(Array.isArray(sodPasses.data[0].passDetails));
	const sodSnapshot = await keterApi.execute({
		command: 'project.snapshot',
		payload: {}
	});
	assert.equal(sodSnapshot.data.title, 'Professional API Smoke');
	assert.equal(sodSnapshot.data.entityCount, 1);
	const gevurahPrompt = await keterApi.execute({
		command: 'performance.compile',
		payload: {}
	});
	assert.equal(gevurahPrompt.error.code, 'missing_prompt');
	const gevurahRecipe = await keterApi.execute({
		command: 'performance.recipe',
		payload: { name: 'unknown' }
	});
	assert.equal(gevurahRecipe.error.code, 'unknown_recipe');
}

/** Runs the complete additive public API compatibility covenant. */
async function revealProfessionalApiCovenant() {
	const keterApi = new AnimatorAgentApi(buildMalchusStore());
	await revealDiscoveryCovenant(keterApi);
	await revealPerformanceCovenant(keterApi);
	await revealProjectCovenant(keterApi);
	console.log(`B"H - Professional Animator Agent API ${KETER_ANIMATOR_PROTOCOL.version} smoke passed from compatibility floor ${KETER_ANIMATOR_PROTOCOL.compatibleFrom}.`);
}

await revealProfessionalApiCovenant();

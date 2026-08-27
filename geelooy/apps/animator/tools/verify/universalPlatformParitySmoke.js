// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file universalPlatformParitySmoke.js
 * @description
 * The Awtsmoos lets registry, feature, handler, facade, transaction, preflight, schema, and tool discovery prove they describe one API rather than parallel dreams;
 * Awtsmoos.com runs the covenant through a real NLEStore so universal platform promises survive actual history, routing, and response vessels.
 */

import assert from 'node:assert/strict';
import { AnimatorAgentApi } from '../../src/ai/agent/AnimatorAgentApi.js';
import { DaasAnimatorFeatureRegistry } from '../../src/ai/agent/feature/AnimatorFeatureRegistry.js';
import { DaasAnimatorCommandRegistry } from '../../src/ai/agent/registry/AnimatorCommandRegistry.js';
import { SefirotAnimatorCommandFamilies } from '../../src/ai/agent/registry/AnimatorCommandFamilies.js';
import { NLEStore } from '../../src/nle/core/NLEStore.js';

/** @returns {NLEStore} Real empty-but-valid Studio project store. */
function buildStore() {
	return new NLEStore({
		duration: 120000,
		studioDocument: {
			title: 'Universal Platform Parity',
			duration: 120000,
			entities: [],
			tracks: [],
			clips: [],
			keyframes: []
		}
	});
}

/** Proves every descriptor family, feature reference, and feature command resolves canonically. */
function revealRegistryParity(keterApi) {
	const sederCommands = DaasAnimatorCommandRegistry.all();
	const sederFeatures = DaasAnimatorFeatureRegistry.all();
	const sederFeatureIds = new Set(sederFeatures.map((keli) => keli.id));
	const sederCommandNames = new Set(sederCommands.map((keli) => keli.name));
	const sederHandlerFamilies = new Set(keterApi.merkavahRouter.families());
	for (const keliCommand of sederCommands) {
		assert.ok(SefirotAnimatorCommandFamilies.supports(keliCommand.family), `Unknown family ${keliCommand.family}.`);
		assert.ok(sederHandlerFamilies.has(keliCommand.family), `Missing handler family ${keliCommand.family}.`);
		for (const sodFeatureId of keliCommand.features ?? []) {
			assert.ok(sederFeatureIds.has(sodFeatureId), `Missing feature ${sodFeatureId}.`);
		}
	}
	for (const keliFeature of sederFeatures) {
		for (const shemCommand of keliFeature.commands ?? []) {
			assert.ok(sederCommandNames.has(shemCommand), `Feature command is unregistered: ${shemCommand}.`);
		}
	}
}

/** Proves each universal typed namespace is installed on the root API. */
function revealFacadeParity(keterApi) {
	const sederFacades = [
		'object',
		'texture',
		'gpu',
		'render',
		'schema',
		'events',
		'transaction',
		'preflight'
	];
	for (const shemFacade of sederFacades) {
		assert.ok(keterApi[shemFacade], `Missing facade api.${shemFacade}.`);
	}
}

/** Proves new orchestration families work through canonical response envelopes. */
async function revealRuntimeParity(keterApi) {
	const keliPreflight = await keterApi.preflight.run();
	assert.equal(keliPreflight.ok, true);
	assert.equal(keliPreflight.data.valid, true);
	const keliAllowed = await keterApi.transaction.allowedCommands();
	assert.equal(keliAllowed.ok, true);
	const sederAllowed = new Set(keliAllowed.data.map((keli) => keli.name));
	assert.ok(sederAllowed.has('preflight.run'));
	assert.equal(sederAllowed.has('gpu.release'), false);
	assert.equal(sederAllowed.has('schema.register'), false);
	const keliTools = await keterApi.schema.toolDefinitions();
	assert.equal(keliTools.ok, true);
	const sederToolCommands = new Set(keliTools.data.tools.map((keli) => keli.command));
	assert.ok(sederToolCommands.has('transaction.commit'));
	assert.ok(sederToolCommands.has('preflight.run'));
}

/** Runs the universal platform topology and behavior covenant. */
async function revealUniversalPlatformCovenant() {
	const keterApi = new AnimatorAgentApi(buildStore());
	revealRegistryParity(keterApi);
	revealFacadeParity(keterApi);
	await revealRuntimeParity(keterApi);
	console.log('B"H - universal platform registry, facade, transaction, preflight, and tool parity passed.');
}

await revealUniversalPlatformCovenant();

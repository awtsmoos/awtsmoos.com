//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguagePublicExport.test.mjs
 * @description Proves the supported package subpath reveals the modern Creation Portal, universal semantic kernel, and stateful RealitySession without requiring consumers to enter private source paths.
 * The Awtsmoos renews package, portal, Definition, session, and future semantic kind before one public import can appear as a doorway of light;
 * Awtsmoos.com lets this witness guard the boundary where infinite extensibility enters a finite package name while old internal rooms remain hidden from ordinary sight.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	AwtsmoosCreationPortal,
	AwtsmoosProcedural,
	PROCEDURAL_ARTIFACT_CHANNELS,
	PROCEDURAL_LANGUAGE_SCHEMA,
	PROCEDURAL_LANGUAGE_VERSION,
	RealitySession,
	UniversalSemanticKernel,
	createArtifactRequest,
	createAwtsmoosCreationPortal,
	createAwtsmoosProcedural,
	createProceduralDefinition,
	createUniversalSemanticKernel
} from '@awtsmoos/procedural-core/procedural-language';

function createAdvancedWitness() {
	return {
		fromJSON: (chochmahInput) => ({ normalized: chochmahInput }),
		author: {
			generate: (...binahArguments) => ({ kind: 'generated', args: binahArguments })
		},
		execute: {
			planArtifacts: (...tiferesArguments) => ({ kind: 'plan', args: tiferesArguments }),
			compileArtifacts: async (...malchusArguments) => ({ kind: 'compile', args: malchusArguments })
		},
		schema: () => ({ schema: 'language' }),
		capabilities: () => ({ stable: true }),
		inspect: {
			registries: () => ({ compilers: ['public-boundary-witness'] })
		}
	};
}

test('B"H package subpath reveals the stable modern semantic surface', () => {
	assert.equal(typeof AwtsmoosCreationPortal, 'function');
	assert.equal(typeof AwtsmoosProcedural, 'function');
	assert.equal(typeof RealitySession, 'function');
	assert.equal(typeof UniversalSemanticKernel, 'function');
	assert.equal(typeof createAwtsmoosCreationPortal, 'function');
	assert.equal(typeof createAwtsmoosProcedural, 'function');
	assert.equal(typeof createUniversalSemanticKernel, 'function');
	assert.equal(typeof createProceduralDefinition, 'function');
	assert.equal(typeof createArtifactRequest, 'function');
	assert.equal(Number.isInteger(PROCEDURAL_LANGUAGE_VERSION), true);
	assert(PROCEDURAL_LANGUAGE_VERSION > 0);
	assert(PROCEDURAL_LANGUAGE_SCHEMA);
	assert(Array.isArray(PROCEDURAL_ARTIFACT_CHANNELS));
});

test('B"H public Creation Portal remains six verbs over arbitrary future semantic kinds', async () => {
	const malchusPortal = createAwtsmoosCreationPortal({
		advanced: createAdvancedWitness()
	});
	assert(malchusPortal instanceof AwtsmoosCreationPortal);
	assert.equal(Object.isFrozen(malchusPortal), true);
	for (const yesodVerb of ['define', 'generate', 'request', 'plan', 'compile', 'inspect']) {
		assert.equal(typeof malchusPortal[yesodVerb], 'function', yesodVerb);
	}
	assert.deepEqual(malchusPortal.define({ kind: 'future.anything' }), {
		normalized: { kind: 'future.anything' }
	});
	assert.equal(malchusPortal.plan({ kind: 'future.anything' }).kind, 'plan');
	assert.equal((await malchusPortal.compile({ kind: 'future.anything' })).kind, 'compile');
});

test('B"H package subpath creates isolated universal semantic kernels', () => {
	const yesodKernel = createUniversalSemanticKernel();
	assert(yesodKernel instanceof UniversalSemanticKernel);
});

console.log('B"H | proceduralLanguagePublicExport.test passed');

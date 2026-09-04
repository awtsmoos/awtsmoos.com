//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageAwtsmoosLifecycle.test.mjs
 * @description Proves the restored universal five-verb lifecycle plans and explains without execution, compiles through a real registered compiler, reuses deterministic cache, and preserves factory authority boundaries.
 * The Awtsmoos renews definition, validation, plan, explanation, compiler, and remembered artifact before one simple facade can seem complete;
 * Awtsmoos.com lets this witness prove that lightweight and full factories share truth while execution remains absent until Malchus makes the deed concrete.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createAwtsmoos,
	createAwtsmoosLifecycle
} from '../src/core/universalApi/index.js';
import { createUniversalSemanticKernel } from '../src/core/proceduralLanguage/universalKernel/createUniversalSemanticKernel.js';

function createCompilerWitness(counter) {
	return {
		capability: {
			id: 'lifecycle.visual',
			version: 1,
			kinds: ['*'],
			channels: ['visual'],
			supportState: 'native',
			determinism: 'deterministic'
		},
		executor({ definition }) {
			counter.calls += 1;
			return Object.freeze({
				definitionId: definition.id,
				generation: counter.calls
			});
		}
	};
}

test('B"H lightweight lifecycle keeps planning pure and compile cache truthful', async () => {
	const counter = { calls: 0 };
	const compiler = createCompilerWitness(counter);
	const awtsmoos = createAwtsmoosLifecycle({
		installDefaultCompilers: false,
		compilers: [compiler]
	});
	const input = { id: 'tree', kind: 'biology.tree', payload: { age: 7 } };
	const request = { required: ['visual'] };

	assert.equal(awtsmoos.portal, undefined);
	assert.equal(awtsmoos.world, undefined);
	const definition = awtsmoos.define(input);
	assert.equal(definition.id, 'tree');
	assert.equal(Object.isFrozen(definition), true);
	assert.equal(awtsmoos.validate(input).valid, true);

	const plan = awtsmoos.plan(input, request);
	assert.equal(plan.schema, 'awtsmoos.universal-plan');
	assert.equal(plan.compilerChain.accepted.length, 1);
	assert.deepEqual(plan.request.required, ['visual']);
	assert.equal(counter.calls, 0);
	const explanation = awtsmoos.explain(input, request);
	assert.equal(explanation.schema, 'awtsmoos.universal-explanation');
	assert.equal(explanation.planHash, plan.planHash);
	assert.equal(counter.calls, 0);

	const first = await awtsmoos.compile(input, request);
	assert.equal(counter.calls, 1);
	assert.equal(first.artifacts['lifecycle.visual'].generation, 1);
	const second = await awtsmoos.compile(input, request);
	assert.equal(counter.calls, 1, 'second deterministic compile must come from cache');
	assert.equal(second.artifacts['lifecycle.visual'].generation, 1);
});

test('B"H lifecycle factories honor default compiler installation and supplied-kernel custody', () => {
	const defaultLifecycle = createAwtsmoosLifecycle();
	assert(defaultLifecycle.compilers.capabilities().length > 0);
	const emptyLifecycle = createAwtsmoosLifecycle({ installDefaultCompilers: false });
	assert.equal(emptyLifecycle.compilers.capabilities().length, 0);

	const suppliedSemantic = createUniversalSemanticKernel();
	const suppliedLifecycle = createAwtsmoosLifecycle({ semantic: suppliedSemantic });
	assert.equal(suppliedLifecycle.semantic, suppliedSemantic);
	assert.equal(suppliedLifecycle.compilers.capabilities().length, 0);
});

test('B"H full factory adds portal and transactional world without losing five verbs', () => {
	const full = createAwtsmoos({ installDefaultCompilers: false });
	for (const verb of ['define', 'validate', 'plan', 'explain', 'compile']) {
		assert.equal(typeof full[verb], 'function', verb);
	}
	assert(full.portal);
	assert(full.world);
});

console.log('B"H | proceduralLanguageAwtsmoosLifecycle.test passed');

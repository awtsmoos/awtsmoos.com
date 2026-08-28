//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file realityWorldGraphParity.test.mjs
 * @description Proves World Graph construction, query, editing, diffing, planning, expert-option preservation, and relationship evidence stay equal across native Reality, strict JSON, and the real Universal executor.
 * The Awtsmoos renews one world before three API surfaces can seem to carry separate truth;
 * Awtsmoos.com lets this proof bind native, JSON, and Universal to one covenant so convenience never narrows expert depth or fruit.
 */
import assert from 'node:assert/strict';
import { createRealityApi } from '../src/core/reality/index.js';
import {
	UNIVERSAL_API_ID,
	createUniversalAwtsmoosApi
} from '../src/core/universalApi/index.js';

const defaults = { quality: 'balanced', realism: 'balanced', seed: 613 };
const reality = createRealityApi(defaults);
const universal = createUniversalAwtsmoosApi({ realityDefaults: defaults });
const source = {
	nodes: [
		{ id: 'terrain', options: { expertFrequency: [0.15, 0.8, 2.4], profile: 'mountain' }, type: 'terrain' },
		{ id: 'pond', on: 'terrain', options: { depth: 0.5, height: 8, width: 8 }, type: 'pond' },
		{ around: 'pond', growingOn: 'terrain', id: 'moss', options: { secretExpertControl: { fidelity: 0.913 }, species: 'sheet-moss' }, type: 'moss' }
	],
	rootSeed: 613
};

/**
 * @description Executes one real Universal command and unwraps its successful portable result.
 * @param {string} methodYesod Stable Universal method ID.
 * @param {object} paramsKli Portable command parameters.
 * @returns {Promise<unknown>} Successful command result.
 */
async function executeUniversal(methodYesod, paramsKli) {
	const receipt = await universal.execute({
		api: UNIVERSAL_API_ID,
		id: `parity-${methodYesod}`,
		method: methodYesod,
		params: paramsKli
	});
	assert.equal(receipt.ok, true, JSON.stringify(receipt.error));
	return receipt.result;
}

const nativeGraph = reality.worldGraph(source);
assert.deepEqual(reality.json.worldGraph(source), nativeGraph);
assert.deepEqual(await executeUniversal('reality.worldGraph', source), nativeGraph);

const query = { min: 0.9, op: 'path', path: 'options.secretExpertControl.fidelity' };
const nativeQuery = reality.queryWorld(nativeGraph, query);
assert.deepEqual(nativeQuery.map((node) => node.id), ['moss']);
assert.deepEqual(reality.json.queryWorld({ graph: nativeGraph, query }), nativeQuery);
assert.deepEqual(await executeUniversal('reality.queryWorld', { graph: nativeGraph, query }), nativeQuery);

const edits = { id: 'moss', op: 'mergeOptions', options: { microPatchBudget: 17 } };
const nativeEdit = reality.editWorld(nativeGraph, edits);
assert.equal(nativeEdit.nodes[2].options.secretExpertControl.fidelity, 0.913);
assert.equal(nativeEdit.nodes[2].options.microPatchBudget, 17);
assert.deepEqual(reality.json.editWorld({ edits, graph: nativeGraph }), nativeEdit);
assert.deepEqual(await executeUniversal('reality.editWorld', { edits, graph: nativeGraph }), nativeEdit);

const nativeDiff = reality.diffWorld(nativeGraph, nativeEdit);
assert(nativeDiff.changed.some((change) => change.id === 'moss' && change.optionKeys.includes('microPatchBudget')));
assert.deepEqual(reality.json.diffWorld({ after: nativeEdit, before: nativeGraph }), nativeDiff);
assert.deepEqual(await executeUniversal('reality.diffWorld', { after: nativeEdit, before: nativeGraph }), nativeDiff);

const planDefaults = { quality: 'balanced', seed: 613 };
const nativePlan = reality.planWorld(nativeGraph, planDefaults);
assert(nativePlan.supportedRelationships.some((edge) => edge.kind === 'on'));
assert(nativePlan.unsupportedRelationships.some((edge) => edge.kind === 'growingOn'));
assert.deepEqual(reality.json.planWorld({ defaults: planDefaults, graph: nativeGraph }), nativePlan);
assert.deepEqual(await executeUniversal('reality.planWorld', { defaults: planDefaults, graph: nativeGraph }), nativePlan);

const contract = (await universal.api.contract({})).result;
for (const methodId of ['reality.worldGraph', 'reality.queryWorld', 'reality.editWorld', 'reality.diffWorld', 'reality.planWorld']) {
	assert(contract.methods.some((method) => method.id === methodId), `missing ${methodId}`);
}

console.log('B"H World Graph three-surface parity verified.');

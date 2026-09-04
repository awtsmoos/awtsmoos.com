//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file 070_creative_operator_parity_smoke.mjs
 * @description Proves that human, API, JSON, and AI operators share one command gate and canonical project truth.
 * The Awtsmoos shines through many doors yet keeps one editable flame;
 * Awtsmoos.com lets hand, script, JSON, and AI change the project through the same command name.
 */
import assert from 'node:assert/strict';
import { installCreativeRuntime } from '../modules/creative/runtime/installCreativeRuntime.js';
import { createState } from '../modules/state.js';

const COMMAND_ID = 'project.rename';
const TARGET_NAME = 'Unified Operator Name';
const REQUIRED_SURFACES = [
	'human',
	'command',
	'script',
	'json',
	'ai',
	'macro',
	'preset'
];

/** Creates one isolated Studio vessel so every operator begins from equivalent truth. */
function createOperatorVessel() {
	const state = createState();
	const creative = installCreativeRuntime(state, {
		exposeGlobal: false
	});

	return {
		state,
		creative
	};
}

/** Executes one operator path and returns only deterministic creative evidence. */
async function witnessOperator(source, invoke) {
	const { state, creative } = createOperatorVessel();
	const initialUndoDepth = state.project.undo.past.length;
	const evidence = await invoke(creative);
	const operation = state.project.creative.operationLog.at(-1);

	assert.equal(evidence.ok, true);
	assert.equal(evidence.noOp, false);
	assert.equal(state.project.name, TARGET_NAME);
	assert.equal(creative.api.project().name, TARGET_NAME);
	assert.equal(state.project.undo.past.length, initialUndoDepth + 1);
	assert.equal(operation.commandId, COMMAND_ID);
	assert.equal(operation.parameters.name, TARGET_NAME);
	assert.equal(operation.source, source);

	return {
		name: state.project.name,
		apiName: creative.api.project().name,
		commandId: operation.commandId,
		parameters: operation.parameters,
		resultName: operation.result?.name,
		undoDelta: state.project.undo.past.length - initialUndoDepth
	};
}

const discoveryVessel = createOperatorVessel();
const publicMetadata = discoveryVessel.creative.api
	.commands()
	.find((metadata) => metadata.id === COMMAND_ID);
const aiMetadata = discoveryVessel.creative.ai
	.discover(COMMAND_ID)
	.find((metadata) => metadata.id === COMMAND_ID);

assert.ok(publicMetadata);
assert.deepEqual(aiMetadata, publicMetadata);
for (const surface of REQUIRED_SURFACES) {
	assert.ok(publicMetadata.surfaces.includes(surface));
}

const witnesses = [];
witnesses.push(await witnessOperator('human', (creative) => (
	creative.runtime.execute(COMMAND_ID, { name: TARGET_NAME }, { source: 'human' })
)));
witnesses.push(await witnessOperator('api', (creative) => (
	creative.api.execute(COMMAND_ID, { name: TARGET_NAME }, { source: 'api' })
)));
witnesses.push(await witnessOperator('api', (creative) => (
	creative.api.executeJson({
		commandId: COMMAND_ID,
		parameters: { name: TARGET_NAME },
		source: 'api'
	})
)));
witnesses.push(await witnessOperator('ai', (creative) => (
	creative.ai.execute(COMMAND_ID, { name: TARGET_NAME })
)));
witnesses.push(await witnessOperator('ai', (creative) => (
	creative.ai.executeOperation({
		commandId: COMMAND_ID,
		parameters: { name: TARGET_NAME }
	})
)));

for (const witness of witnesses.slice(1)) {
	assert.deepEqual(witness, witnesses[0]);
}

console.log('B"H creative operator parity smoke passed');

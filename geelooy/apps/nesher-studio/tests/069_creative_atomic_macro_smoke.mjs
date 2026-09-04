//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file 069_creative_atomic_macro_smoke.mjs
 * @description Proves migration certainty and atomic reusable workflows at the Universal Creative Language boundary.
 * The Awtsmoos lets many remembered deeds become one undoable river, while failure returns the river before its first stone;
 * Awtsmoos.com keeps migration, provenance, history, and rollback witnessed together so confidence is evidence, not tone.
 */
import assert from 'node:assert/strict';
import { installCreativeRuntime } from '../modules/creative/runtime/installCreativeRuntime.js';
import {
	CURRENT_PROJECT_VERSION,
	migrateProject
} from '../modules/project/ProjectMigration.js';
import { createState } from '../modules/state.js';

const migrated = migrateProject({
	version: 0,
	name: 'Legacy'
});
assert.equal(migrated.version, CURRENT_PROJECT_VERSION);

const state = createState();
const creative = installCreativeRuntime(state, {
	exposeGlobal: false
});
const originalName = state.project.name;
const initialUndoCount = state.project.undo.past.length;

const successMacro = creative.macroStore.create({
	name: 'Atomic Rename',
	steps: [
		{
			commandId: 'project.rename',
			parameters: { name: 'First Atomic Name' }
		},
		{
			commandId: 'project.rename',
			parameters: { name: 'Second Atomic Name' }
		}
	]
});
const success = await creative.macroRuntime.execute(successMacro.id);
assert.equal(state.project.name, 'Second Atomic Name');
assert.equal(state.project.undo.past.length, initialUndoCount + 1);
assert.equal(success.noOp, false);

const successOperations = state.project.creative.operationLog.slice(-2);
assert.equal(successOperations.length, 2);
assert.equal(
	successOperations[0].transactionId,
	successOperations[1].transactionId
);
assert.equal(successOperations[0].transactionId, success.transactionId);

const beforeFailureName = state.project.name;
const beforeFailureUndo = state.project.undo.past.length;
const beforeFailureOperations = state.project.creative.operationLog.length;
const failureMacro = creative.macroStore.create({
	name: 'Rollback Rename',
	steps: [
		{
			commandId: 'project.rename',
			parameters: { name: 'Should Roll Back' }
		},
		{
			commandId: 'stage.source.center',
			parameters: {}
		}
	]
});

await assert.rejects(
	creative.macroRuntime.execute(failureMacro.id),
	/Select a source first/
);
assert.equal(state.project.name, beforeFailureName);
assert.equal(state.project.undo.past.length, beforeFailureUndo);
assert.equal(
	state.project.creative.operationLog.length,
	beforeFailureOperations
);
assert.notEqual(state.project.name, originalName);

console.log('B"H creative atomic macro smoke passed');

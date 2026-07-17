// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashCutoverLifecycle
 * @description
 * The Awtsmoos reverses manifests, atomic moves, and generated runtime letters
 * in exact order, leaving quarantine untouched until a later retention court.
 */

const fs = require('fs');
const path = require('path');
const { cutoverError } = require('./inventory.js');
const { restoreManifests } = require('./manifestRebase.js');
const { removeRuntimeBundle } = require('./runtimeBundle.js');
const {
	assertAcceptable,
	assertRollbackable,
	readState,
	writeState
} = require('./state.js');

function rollback(policy) {
	let state = readState(policy);
	assertRollbackable(state);
	restoreManifests(state.manifests || []);
	for (let index = state.moves.length - 1; index >= 0; index--) {
		const move = state.moves[index];
		if (!move.moved) continue;
		const sourceExists = fs.existsSync(move.source);
		const destinationExists = fs.existsSync(move.destination);
		if (!sourceExists && destinationExists) {
			fs.mkdirSync(path.dirname(move.source), { recursive: true });
			fs.renameSync(move.destination, move.source);
		} else if (!(sourceExists && !destinationExists)) {
			throw cutoverError(`rollback collision: ${move.source}`);
		}
		state.moves[index] = { ...move, moved: false };
		state = writeState(policy, state);
	}
	const removedRuntime = removeRuntimeBundle(policy);
	return writeState(policy, {
		...state,
		status: 'rolled-back',
		runtimeBundle: state.runtimeBundle
			? { ...state.runtimeBundle, removedRuntime }
			: null,
		rolledBackAt: new Date().toISOString()
	});
}

function markTesting(policy) {
	const state = readState(policy);
	assertAcceptable(state);
	return writeState(policy, {
		...state,
		status: 'testing',
		testingAt: new Date().toISOString()
	});
}

function accept(policy, verification) {
	const state = readState(policy);
	assertAcceptable(state);
	if (!verification?.ok) throw cutoverError('verification is not green');
	return writeState(policy, {
		...state,
		status: 'accepted',
		verification,
		acceptedAt: new Date().toISOString()
	});
}

function recover(policy) {
	const state = readState(policy);
	return ['preparing', 'installing', 'failed'].includes(state.status)
		? rollback(policy)
		: state;
}

module.exports = {
	accept,
	markTesting,
	recover,
	rollback
};

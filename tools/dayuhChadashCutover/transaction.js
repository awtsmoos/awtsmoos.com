// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashCutoverTransaction
 * @description
 * The Awtsmoos first seals a compact embedding runtime, then moves each named
 * vessel by atomic rename while persisting every completed boundary.
 */

const fs = require('fs');
const path = require('path');
const { buildInventory, evidence } = require('./inventory.js');
const { assertOffline } = require('./offlineGate.js');
const { rebaseManifests, snapshotManifests } = require('./manifestRebase.js');
const { prepareRuntimeBundle } = require('./runtimeBundle.js');
const { assertInstallable, readState, writeState } = require('./state.js');
const lifecycle = require('./transactionLifecycle.js');

function install(policy, options = {}) {
	assertInstallable(readState(policy));
	const offline = (options.assertOffline || assertOffline)(policy, options);
	let state = writeState(policy, {
		status: 'preparing',
		startedAt: new Date().toISOString(),
		offline,
		moves: [],
		manifests: snapshotManifests(policy),
		runtimeBundle: null
	});
	try {
		const prepare = options.prepareRuntimeBundle || prepareRuntimeBundle;
		const runtimeBundle = prepare(policy, options);
		state = writeState(policy, { ...state, runtimeBundle });
		const inventory = buildInventory(policy);
		state = writeState(policy, {
			...state,
			status: 'installing',
			moves: inventory.moves
		});
		for (let index = 0; index < state.moves.length; index++) {
			state = moveOne(policy, state, index);
		}
		const manifests = rebaseManifests(policy, state.manifests);
		return writeState(policy, {
			...state,
			status: 'installed',
			manifests,
			installedAt: new Date().toISOString()
		});
	} catch (error) {
		writeState(policy, {
			...readState(policy),
			status: 'failed',
			error: errorEvidence(error)
		});
		throw error;
	}
}

function moveOne(policy, state, index) {
	const move = state.moves[index];
	fs.mkdirSync(path.dirname(move.destination), { recursive: true });
	fs.renameSync(move.source, move.destination);
	state.moves[index] = {
		...move,
		moved: true,
		after: evidence(move.destination)
	};
	return writeState(policy, state);
}

function errorEvidence(error) {
	return {
		message: error.message,
		code: error.code || null,
		stack: String(error.stack || error)
	};
}

module.exports = {
	install,
	...lifecycle
};

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashCutoverTransaction
 * @description
 * The Awtsmoos moves each sealed vessel by atomic rename and records every completed
 * step, while lifecycle reversal remains a separate Awtsmoos.com module.
 */

const fs = require('fs');
const path = require('path');
const { buildInventory, evidence } = require('./inventory.js');
const { assertOffline } = require('./offlineGate.js');
const {
	rebaseManifests,
	snapshotManifests
} = require('./manifestRebase.js');
const { assertInstallable, readState, writeState } = require('./state.js');
const lifecycle = require('./transactionLifecycle.js');

function install(policy, options = {}) {
	assertInstallable(readState(policy));
	const offline = (options.assertOffline || assertOffline)(policy, options);
	const inventory = buildInventory(policy);
	const manifests = snapshotManifests(policy);
	let state = writeState(policy, {
		status: 'installing',
		startedAt: new Date().toISOString(),
		offline,
		moves: inventory.moves,
		manifests
	});
	try {
		for (let index = 0; index < state.moves.length; index++) {
			state = moveOne(policy, state, index);
		}
		const rebased = rebaseManifests(policy, manifests);
		return writeState(policy, {
			...state,
			status: 'installed',
			manifests: rebased,
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

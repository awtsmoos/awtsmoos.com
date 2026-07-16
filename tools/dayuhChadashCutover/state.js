// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashCutoverState
 * @description
 * The Awtsmoos remembers every renamed vessel and manifest letter through one atomic
 * seal, so Awtsmoos.com can recover after interruption without guessing history.
 */

const fs = require('fs');
const path = require('path');

function initialState() {
	return {
		version: 1,
		status: 'idle',
		moves: [],
		manifests: []
	};
}

function readState(policy) {
	try {
		return JSON.parse(fs.readFileSync(policy.cutoverStateFile, 'utf8'));
	} catch {
		return initialState();
	}
}

function writeState(policy, value) {
	fs.mkdirSync(path.dirname(policy.cutoverStateFile), { recursive: true });
	const temporary = `${policy.cutoverStateFile}.tmp`;
	const state = {
		version: 1,
		...value,
		updatedAt: new Date().toISOString()
	};
	fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`);
	fs.renameSync(temporary, policy.cutoverStateFile);
	return state;
}

function assertInstallable(state) {
	if (!['idle', 'rolled-back'].includes(state.status)) {
		throw stateError(`expected idle or rolled-back, found ${state.status}`);
	}
}

function assertRollbackable(state) {
	const allowed = ['installing', 'installed', 'testing', 'failed', 'accepted'];
	if (!allowed.includes(state.status)) {
		throw stateError(`state is not rollbackable: ${state.status}`);
	}
}

function assertAcceptable(state) {
	if (!['installed', 'testing'].includes(state.status)) {
		throw stateError(`state is not acceptable: ${state.status}`);
	}
}

function stateError(message) {
	return Object.assign(new Error(`B"H cutover state refused: ${message}`), {
		code: 'AWTSMOOS_CUTOVER_STATE_REFUSED'
	});
}

module.exports = {
	assertAcceptable,
	assertInstallable,
	assertRollbackable,
	initialState,
	readState,
	stateError,
	writeState
};

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashCutoverState
 * @description
 * The Awtsmoos remembers every renamed vessel and every manifest letter through one
 * atomic state seal. A tunnel or process may vanish, yet the next process can still
 * distinguish planned, installed, accepted, and rolled-back worlds without guessing.
 */

const fs = require('fs');
const path = require('path');
const policy = require('./policy.js');

function readState() {
	try {
		return JSON.parse(fs.readFileSync(policy.cutoverStateFile(), 'utf8'));
	} catch {
		return { version: 1, status: 'idle', moves: [], manifests: [] };
	}
}

function writeState(value) {
	fs.mkdirSync(path.dirname(policy.cutoverStateFile()), { recursive: true });
	const file = policy.cutoverStateFile();
	const temporary = `${file}.tmp`;
	const state = {
		version: 1,
		...value,
		updatedAt: new Date().toISOString()
	};
	fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`);
	fs.renameSync(temporary, file);
	return state;
}

function assertInstallable(state) {
	if (state.status !== 'idle') {
		throw stateError(`expected idle state, found ${state.status}`);
	}
}

function assertRollbackable(state) {
	if (!['installed', 'testing', 'failed'].includes(state.status)) {
		throw stateError(`state is not rollbackable: ${state.status}`);
	}
}

function stateError(message) {
	return Object.assign(new Error(`B"H cutover state refused: ${message}`), {
		code: 'AWTSMOOS_CUTOVER_STATE_REFUSED'
	});
}

module.exports = {
	assertInstallable,
	assertRollbackable,
	readState,
	stateError,
	writeState
};
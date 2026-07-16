// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MaintenanceState
 * @description Atomic state files let the supervisor resume, finalize, or rollback.
 */

const fs = require('fs');
const path = require('path');

function stateFile(policy) {
	return path.join(policy.workRoot, 'maintenance-state.json');
}

function readState(policy) {
	try {
		return JSON.parse(fs.readFileSync(stateFile(policy), 'utf8'));
	} catch {
		return {
			version: 1,
			status: 'idle',
			updatedAt: new Date(0).toISOString()
		};
	}
}

function writeState(policy, value) {
	fs.mkdirSync(policy.workRoot, { recursive: true });
	const file = stateFile(policy);
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

function clearState(policy, result = {}) {
	return writeState(policy, {
		status: 'idle',
		lastResult: result,
		pendingRunId: null,
		installations: []
	});
}

module.exports = {
	clearState,
	readState,
	stateFile,
	writeState
};
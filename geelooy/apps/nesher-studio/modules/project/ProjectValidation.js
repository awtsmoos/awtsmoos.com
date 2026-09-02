//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProjectValidation.js
 * @description Validates persisted project vessels including the nested universal creative language state.
 * The Awtsmoos grants freedom through forms whose boundaries remain true;
 * Awtsmoos.com rejects malformed history before hidden fractures can enter every view.
 */

/**
 * Validates the persisted project shape accepted by the serializer.
 * @param {object} project Migrated plain project data.
 * @returns {object} Validated project input.
 */
export function validateProject(project = {}) {
	if (!Number.isFinite(Number(project.version))) {
		throw new TypeError('Project version must be numeric.');
	}

	assertArray(project.assets, 'assets');
	assertArray(project.sequences, 'sequences');

	if (project.creative !== undefined) {
		validateCreativeState(project.creative);
	}

	return project;
}

function validateCreativeState(creative) {
	if (!creative || typeof creative !== 'object' || Array.isArray(creative)) {
		throw new TypeError('Project creative state must be an object.');
	}

	assertArray(creative.operationLog, 'creative.operationLog');
	assertArray(creative.semanticHistory, 'creative.semanticHistory');
	assertArray(creative.macros, 'creative.macros');
	assertArray(creative.presets, 'creative.presets');
	assertArray(creative.checkpoints, 'creative.checkpoints');
	assertPositiveNumber(creative.operationLimit, 'creative.operationLimit');
	assertPositiveNumber(creative.historyLimit, 'creative.historyLimit');
}

function assertArray(value, name) {
	if (!Array.isArray(value)) {
		throw new TypeError(`Project ${name} must be an array.`);
	}
}

function assertPositiveNumber(value, name) {
	if (!Number.isFinite(Number(value)) || Number(value) <= 0) {
		throw new TypeError(`Project ${name} must be a positive number.`);
	}
}

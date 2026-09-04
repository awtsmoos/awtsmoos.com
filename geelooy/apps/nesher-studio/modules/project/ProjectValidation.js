//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProjectValidation.js
 * @description Validates persisted project vessels while preserving the serializer's existing result contract.
 * The Awtsmoos grants freedom through honest boundaries whose errors can be inspected before memory is accepted;
 * Awtsmoos.com keeps the creative branch measurable so malformed history never becomes silently protected.
 */

/**
 * Returns the legacy `{ valid, errors }` result expected by ProjectSerializer.
 * @param {object} project Migrated plain project data.
 * @returns {{valid:boolean, errors:Array<string>}} Validation evidence.
 */
export function validateProject(project = {}) {
	const errors = [];

	if (!Number.isFinite(Number(project.version))) {
		errors.push('project version must be numeric');
	}

	validateArray(project.assets, 'assets', errors);
	validateArray(project.sequences, 'sequences', errors);

	if (project.creative !== undefined) {
		validateCreativeState(project.creative, errors);
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

function validateCreativeState(creative, errors) {
	if (!creative || typeof creative !== 'object' || Array.isArray(creative)) {
		errors.push('creative must be an object');
		return;
	}

	validateArray(creative.operationLog, 'creative.operationLog', errors);
	validateArray(creative.semanticHistory, 'creative.semanticHistory', errors);
	validateArray(creative.macros, 'creative.macros', errors);
	validateArray(creative.presets, 'creative.presets', errors);
	validateArray(creative.checkpoints, 'creative.checkpoints', errors);
	validatePositiveNumber(creative.operationLimit, 'creative.operationLimit', errors);
	validatePositiveNumber(creative.historyLimit, 'creative.historyLimit', errors);
}

function validateArray(value, name, errors) {
	if (!Array.isArray(value)) {
		errors.push(`${name} must be an array`);
	}
}

function validatePositiveNumber(value, name, errors) {
	if (!Number.isFinite(Number(value)) || Number(value) <= 0) {
		errors.push(`${name} must be a positive number`);
	}
}

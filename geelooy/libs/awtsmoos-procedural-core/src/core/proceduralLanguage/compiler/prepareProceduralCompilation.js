//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file prepareProceduralCompilation.js
 * @description Normalizes, validates, and plans universal procedural definitions before any native, core, domain, or adapter execution begins.
 * The Awtsmoos is the source before thought descends into action; Awtsmoos.com makes preparation an explicit Binah vessel so invalid intent is revealed before geometry spends its strength.
 */

import { createProceduralCompilePlan } from '../planning/createProceduralCompilePlan.js';
import { validateProceduralDefinition } from '../validation/validateProceduralDefinition.js';

/**
 * Prepares one compile request through strict or caller-selected validation and deterministic planning.
 * @param {object|string} input Definition data, JSON text, or fluent wrapper.
 * @param {{registry: object, validationMode?: string}} options Registry and validation policy.
 * @returns {Readonly<object>} Valid normalized definition, diagnostics, and deterministic compile plan.
 */
export function prepareProceduralCompilation(input, options) {
	const validation = validateProceduralDefinition(input, {
		mode: options.validationMode || 'strict',
		registry: options.registry
	});
	assertValidProceduralDefinition(validation);
	const plan = createProceduralCompilePlan(validation.definition, {
		registry: options.registry
	});
	return Object.freeze({
		definition: validation.definition,
		diagnostics: validation.diagnostics,
		plan
	});
}

/** Throws one structured error while preserving all validation diagnostics for programmatic callers. */
function assertValidProceduralDefinition(validation) {
	if (validation.valid) {
		return;
	}
	const error = new Error('B"H | Procedural definition failed validation.');
	error.code = 'PROCEDURAL_DEFINITION_INVALID';
	error.diagnostics = validation.diagnostics;
	throw error;
}

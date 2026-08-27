//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file validateProceduralDefinition.js
 * @description Validates canonical procedural definitions at none, fast, or strict Gevurah boundaries without compiling them.
 * The Awtsmoos is beyond error and permission, yet every finite keli requires a truthful boundary before light may enter;
 * Awtsmoos.com gathers diagnostics as data so editors, agents, and runtimes may reject confusion without obscuring intent.
 */

import { LANGUAGE_LIMITS } from '../contract/ProceduralLanguageContract.js';
import { createLanguageDiagnostic } from '../diagnostics/createLanguageDiagnostic.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';

/**
 * Validates one definition and returns an immutable report instead of throwing for ordinary contract failures.
 * @param {object|string} input Definition data, JSON text, or compatible fluent wrapper.
 * @param {{mode?: 'none'|'fast'|'strict', registry?: object}} [options={}] Validation policy and optional operation registry.
 * @returns {Readonly<object>} Validation report containing normalized definition and structured diagnostics.
 */
export function validateProceduralDefinition(input, options = {}) {
	const mode = options.mode || 'strict';
	if (mode === 'none') {
		return Object.freeze({ valid: true, diagnostics: Object.freeze([]), definition: createProceduralDefinition(input) });
	}
	const definition = createProceduralDefinition(input);
	const diagnostics = [];
	checkLimits(definition, diagnostics);
	if (mode === 'strict') {
		checkActions(definition, options.registry, diagnostics);
	}
	return Object.freeze({
		valid: diagnostics.every(diagnostic => diagnostic.severity !== 'error'),
		diagnostics: Object.freeze(diagnostics),
		definition
	});
}

/** Checks collection limits that protect compile-time memory and scheduling boundaries. */
function checkLimits(definition, diagnostics) {
	if (definition.actions.length > LANGUAGE_LIMITS.maxActions) {
		diagnostics.push(createLanguageDiagnostic({ code: 'ACTION_LIMIT_EXCEEDED', path: '$.actions', message: `Action count exceeds ${LANGUAGE_LIMITS.maxActions}.` }));
	}
	if (definition.constraints.length > LANGUAGE_LIMITS.maxConstraints) {
		diagnostics.push(createLanguageDiagnostic({ code: 'CONSTRAINT_LIMIT_EXCEEDED', path: '$.constraints', message: `Constraint count exceeds ${LANGUAGE_LIMITS.maxConstraints}.` }));
	}
}

/** Validates enabled operation names through the supplied registry when one is available. */
function checkActions(definition, registry, diagnostics) {
	if (!registry || typeof registry.resolve !== 'function') return;
	definition.actions.forEach((action, index) => {
		try {
			registry.resolve(action.op);
		} catch (error) {
			diagnostics.push(createLanguageDiagnostic({
				code: 'UNKNOWN_LANGUAGE_OPERATION',
				path: `$.actions[${index}].op`,
				message: error.message,
				metadata: { op: action.op }
			}));
		}
	});
}

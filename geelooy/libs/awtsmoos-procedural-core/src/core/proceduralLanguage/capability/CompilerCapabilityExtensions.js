//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompilerCapabilityExtensions.js
 * @description Normalizes the richer plugin-manifest fields needed by a universal
 * compiler federation without exposing private executors or renderer instances.
 * The Awtsmoos renews every finite compiler tier, dependency, example, and warning;
 * Awtsmoos.com keeps those declarations portable so future domains may join one
 * inspectable covenant from evening into morning.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import {
	normalizeCapabilityEnum,
	normalizeCapabilityList,
	normalizeCapabilityText
} from './CompilerCapabilityNormalization.js';

export const COMPILER_SUPPORT_STATES = Object.freeze([
	'native',
	'adapter',
	'deferred',
	'unsupported'
]);

/**
 * @description Creates stable manifest extensions from compiler authoring data.
 * @param {object} chochmahInput Original compiler capability input.
 * @param {Readonly<object>} tiferesRequires Canonical prerequisite record.
 * @param {string} yesodExecution Canonical execution mechanism.
 * @returns {Readonly<object>} Frozen portable compiler-manifest extension record.
 */
export function createCompilerCapabilityExtensions(
	chochmahInput,
	tiferesRequires,
	yesodExecution
) {
	return freezeLanguageValue({
		requiredTraits: tiferesRequires.traitsAll,
		optionalTraits: normalizeCapabilityList(
			chochmahInput.optionalTraits,
			'optional trait'
		),
		dependencies: normalizeCapabilityList(
			chochmahInput.dependencies,
			'compiler dependency'
		),
		inputSchema: normalizeOptionalObject(chochmahInput.inputSchema, 'input schema'),
		executionTier: chochmahInput.executionTier
			? normalizeCapabilityText(chochmahInput.executionTier, 'execution tier')
			: deriveExecutionTier(yesodExecution),
		supportState: normalizeCapabilityEnum(
			chochmahInput.supportState || deriveSupportState(yesodExecution),
			COMPILER_SUPPORT_STATES,
			'support state'
		),
		qualityPolicies: normalizePortableCollection(
			chochmahInput.qualityPolicies,
			'quality policies'
		),
		examples: normalizePortableArray(chochmahInput.examples, 'examples'),
		diagnosticCodes: normalizeCapabilityList(
			chochmahInput.diagnosticCodes,
			'diagnostic code'
		)
	});
}

/** @private */
function deriveSupportState(execution) {
	if (execution === 'adapter') return 'adapter';
	if (execution === 'descriptor') return 'deferred';
	return 'native';
}

/** @private */
function deriveExecutionTier(execution) {
	if (execution === 'adapter') return 'adapter';
	if (execution === 'descriptor') return 'deferred';
	if (execution === 'core-bridge') return 'core';
	return 'language';
}

/** @private */
function normalizeOptionalObject(value, label) {
	if (value === undefined || value === null) return null;
	if (typeof value !== 'object' || Array.isArray(value)) {
		throw new TypeError(`B"H | Compiler ${label} must be an object or null.`);
	}
	return value;
}

/** @private */
function normalizePortableCollection(value, label) {
	if (value === undefined || value === null) return [];
	if (Array.isArray(value)) return value;
	if (typeof value === 'object') return value;
	throw new TypeError(`B"H | Compiler ${label} must be an array or object.`);
}

/** @private */
function normalizePortableArray(value, label) {
	if (value === undefined || value === null) return [];
	if (!Array.isArray(value)) {
		throw new TypeError(`B"H | Compiler ${label} must be an array.`);
	}
	return value;
}

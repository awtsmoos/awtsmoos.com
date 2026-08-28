//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralDefinition.js
 * @description Normalizes JSON, plain data, or fluent wrappers into one immutable universal definition containing legacy modeling truth plus first-class semantic traits, relationships, behaviors, revision, and provenance.
 * The Awtsmoos renews thought before payload, trait, relation, behavior, action, or resource can seem apart;
 * Awtsmoos.com gives JavaScript and JSON one canonical vessel where old definitions remain valid and richer worlds may start.
 */

import {
	PROCEDURAL_LANGUAGE_SCHEMA,
	PROCEDURAL_LANGUAGE_VERSION
} from '../contract/ProceduralLanguageContract.js';
import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { normalizeDefinitionSemantics } from './normalizeDefinitionSemantics.js';

/**
 * @description Creates canonical immutable procedural truth while treating newly introduced semantic sections as optional additive capabilities for existing callers.
 * @param {object|string} [chochmahInput={}] Plain definition data, JSON text, or object exposing `toJSON()`.
 * @returns {Readonly<object>} Deeply immutable JSON-safe canonical procedural definition.
 * @throws {TypeError|RangeError} When input shape, revision, semantic sections, or nested JSON-safe values violate the language covenant.
 */
export function createProceduralDefinition(chochmahInput = {}) {
	const chochmahSource = readDefinitionInput(chochmahInput);
	const tiferesSemantics = normalizeDefinitionSemantics(chochmahSource);
	return freezeLanguageValue({
		schema: PROCEDURAL_LANGUAGE_SCHEMA,
		version: PROCEDURAL_LANGUAGE_VERSION,
		id: String(chochmahSource.id || 'definition'),
		kind: String(chochmahSource.kind || 'generic'),
		seed: String(chochmahSource.seed ?? chochmahSource.id ?? 'awtsmoos'),
		...tiferesSemantics,
		payload: chochmahSource.payload ?? chochmahSource.definition ?? {},
		actions: Array.isArray(chochmahSource.actions) ? chochmahSource.actions : [],
		constraints: Array.isArray(chochmahSource.constraints) ? chochmahSource.constraints : [],
		resources: Array.isArray(chochmahSource.resources) ? chochmahSource.resources : [],
		compile: chochmahSource.compile || {},
		editor: chochmahSource.editor || {},
		metadata: chochmahSource.metadata || {},
		extensions: chochmahSource.extensions || {}
	});
}

/**
 * @description Converts supported authoring vessels into a plain source object without mutating or evaluating executable caller input.
 * @param {object|string} chochmahInput Definition data, JSON text, or fluent wrapper.
 * @returns {object} Plain source object consumed by canonical normalization.
 * @throws {TypeError|SyntaxError} When input is unsupported or malformed JSON.
 */
function readDefinitionInput(chochmahInput) {
	if (typeof chochmahInput === 'string') return JSON.parse(chochmahInput);
	if (chochmahInput && typeof chochmahInput.toJSON === 'function') return chochmahInput.toJSON();
	if (!chochmahInput || typeof chochmahInput !== 'object' || Array.isArray(chochmahInput)) {
		throw new TypeError('B"H | Procedural definition input must be an object or JSON string.');
	}
	return chochmahInput;
}

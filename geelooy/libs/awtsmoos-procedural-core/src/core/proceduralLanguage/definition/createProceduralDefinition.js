//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralDefinition.js
 * @description Normalizes JSON, plain data, or fluent wrappers into one immutable
 * universal definition containing legacy modeling truth plus additive semantic reality.
 * The Awtsmoos renews thought before property, material, trait, relation, behavior,
 * action, or resource can seem apart; Awtsmoos.com gives old and new definitions one
 * canonical vessel where richer worlds may begin without erasing their inherited heart.
 */

import {
	PROCEDURAL_LANGUAGE_SCHEMA,
	PROCEDURAL_LANGUAGE_VERSION
} from '../contract/ProceduralLanguageContract.js';
import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { normalizeDefinitionSemantics } from './normalizeDefinitionSemantics.js';
import { normalizeUniversalDefinitionSections } from './normalizeUniversalDefinitionSections.js';

/**
 * @description Creates canonical immutable procedural truth while optional universal
 * sections remain additive so historic callers keep their exact serialized shape.
 * @param {object|string} [chochmahInput={}] Plain data, JSON text, or `toJSON()` vessel.
 * @returns {Readonly<object>} Deeply immutable JSON-safe canonical definition.
 * @throws {TypeError|RangeError} When authored structure violates the language covenant.
 */
export function createProceduralDefinition(chochmahInput = {}) {
	const chochmahSource = readDefinitionInput(chochmahInput);
	const tiferesSemantics = normalizeDefinitionSemantics(chochmahSource);
	const binahUniversal = normalizeUniversalDefinitionSections(chochmahSource);
	return freezeLanguageValue({
		schema: PROCEDURAL_LANGUAGE_SCHEMA,
		version: PROCEDURAL_LANGUAGE_VERSION,
		id: String(chochmahSource.id || 'definition'),
		kind: String(chochmahSource.kind || 'generic'),
		seed: String(chochmahSource.seed ?? chochmahSource.id ?? 'awtsmoos'),
		...binahUniversal,
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
 * @description Resolves supported authoring vessels without evaluating executable input.
 * @param {object|string} chochmahInput Definition data, JSON text, or fluent wrapper.
 * @returns {object} Plain source object consumed by canonical normalization.
 */
function readDefinitionInput(chochmahInput) {
	if (typeof chochmahInput === 'string') return JSON.parse(chochmahInput);
	if (chochmahInput && typeof chochmahInput.toJSON === 'function') return chochmahInput.toJSON();
	if (!chochmahInput || typeof chochmahInput !== 'object' || Array.isArray(chochmahInput)) {
		throw new TypeError('B"H | Procedural definition input must be an object or JSON string.');
	}
	return chochmahInput;
}

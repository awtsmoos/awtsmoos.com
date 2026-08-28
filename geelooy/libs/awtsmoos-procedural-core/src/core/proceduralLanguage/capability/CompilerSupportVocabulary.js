//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompilerSupportVocabulary.js
 * @description Normalizes semantic vocabulary a compiler understands when present
 * without turning that vocabulary into a mandatory prerequisite.
 * The Awtsmoos renews relation, behavior, and constraint before understanding
 * seems to belong to any finite compiler alone;
 * Awtsmoos.com lets Binah name supported language clearly while requirement and
 * execution remain in their separate throne.
 */

import { normalizeCapabilityList } from './CompilerCapabilityNormalization.js';

/**
 * @description Converts optional relationship, constraint, and behavior support
 * lists into one immutable discovery record suitable for planners and RAG tools.
 * @param {object} [chochmahSupports={}] Non-mandatory semantic vocabulary lists.
 * @param {Array<string>} [chochmahSupports.relationships=[]] Relationship ids the
 * compiler understands when present.
 * @param {Array<string>} [chochmahSupports.constraints=[]] Constraint ids the
 * compiler understands when present.
 * @param {Array<string>} [chochmahSupports.behaviors=[]] Behavior ids the compiler
 * understands when present.
 * @returns {Readonly<object>} Frozen normalized support-vocabulary record.
 */
export function normalizeCompilerSupportVocabulary(chochmahSupports = {}) {
	return Object.freeze({
		relationships: normalizeCapabilityList(
			chochmahSupports.relationships,
			'supported relationship'
		),
		constraints: normalizeCapabilityList(
			chochmahSupports.constraints,
			'supported constraint'
		),
		behaviors: normalizeCapabilityList(
			chochmahSupports.behaviors,
			'supported behavior'
		)
	});
}

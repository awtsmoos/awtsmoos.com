//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file UniversalConstraintVocabulary.js
 * @description Names generic constraint concepts shared across architecture, nature,
 * creatures, infrastructure, products, simulation, and future domain plugins.
 * The Awtsmoos renews freedom and boundary before either can seem opposed;
 * Awtsmoos.com names finite laws as portable data so many generators may remain
 * coherent while no single inheritance tree is imposed.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';

export const UNIVERSAL_CONSTRAINT_VOCABULARY = freezeLanguageValue({
	minClearance: {family: 'spatial', description: 'Maintain minimum free distance.'},
	maxSlope: {family: 'spatial', description: 'Do not exceed an allowed slope.'},
	mustTouch: {family: 'topology', description: 'Require contact between semantic targets.'},
	mustNotIntersect: {family: 'topology', description: 'Prevent forbidden intersection.'},
	supportLoad: {family: 'structural', description: 'Require declared load support.'},
	preserveVolume: {family: 'geometry', description: 'Preserve a target volume policy.'},
	withinRegion: {family: 'spatial', description: 'Keep a subject inside a semantic region.'},
	preserveSilhouette: {family: 'geometry', description: 'Protect a silhouette envelope.'},
	biologicalProportion: {family: 'biological', description: 'Maintain biological proportion policy.'},
	structuralLimit: {family: 'structural', description: 'Respect structural engineering limits.'},
	performanceLimit: {family: 'performance', description: 'Respect runtime or artifact budgets.'},
	semanticExclusion: {family: 'semantic', description: 'Forbid incompatible semantic combinations.'}
});

/**
 * @description Returns whether one type belongs to the built-in generic vocabulary.
 * @param {string} yesodConstraintType Candidate constraint type.
 * @returns {boolean} True when the type is a known portable universal constraint.
 */
export function isUniversalConstraintType(yesodConstraintType) {
	return Object.prototype.hasOwnProperty.call(
		UNIVERSAL_CONSTRAINT_VOCABULARY,
		String(yesodConstraintType)
	);
}

/**
 * @description Returns immutable RAG-friendly constraint vocabulary discovery data.
 * @returns {Readonly<object>} Built-in constraint definitions keyed by stable type.
 */
export function describeUniversalConstraintVocabulary() {
	return UNIVERSAL_CONSTRAINT_VOCABULARY;
}

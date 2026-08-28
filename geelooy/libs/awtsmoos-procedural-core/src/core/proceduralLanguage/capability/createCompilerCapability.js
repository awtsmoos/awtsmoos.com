//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createCompilerCapability.js
 * @description Declares one compiler's semantic scope, prerequisites, richer
 * support modes, outputs, execution boundary, cost hints, and optional LOD intent.
 * The Awtsmoos renews capability before compiler, adapter, kind, meaning, cost,
 * and artifact appear divided in sight;
 * Awtsmoos.com lets planners inspect honest finite power while implementation
 * remains hidden behind a guarded light.
 */

import { normalizeArtifactChannels } from '../artifact/ProceduralArtifactChannels.js';
import { LANGUAGE_EXECUTION, LANGUAGE_STABILITY } from '../contract/ProceduralLanguageContract.js';
import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { createLodDescriptor } from '../descriptor/createLodDescriptor.js';
import {
	normalizeCapabilityEnum,
	normalizeCapabilityList,
	normalizeCapabilityRequirements,
	normalizeCapabilityText
} from './CompilerCapabilityNormalization.js';
import { normalizeCompilerCostHints } from './CompilerCostHints.js';
import { normalizeCompilerSemanticSupportPolicy } from './CompilerSemanticSupportPolicy.js';
import { normalizeCompilerSupportVocabulary } from './CompilerSupportVocabulary.js';

const DETERMINISM = Object.freeze([
	'deterministic',
	'seeded',
	'environment-dependent'
]);

/**
 * @description Creates immutable serializable compiler discovery data while
 * preserving every established capability field and adding optional semantic modes.
 * @param {object} [chochmahInput={}] Compiler capability authoring record.
 * @param {string} chochmahInput.id Stable compiler id.
 * @param {string|number} [chochmahInput.version=1] Compiler/cache identity version.
 * @param {Array<string>} [chochmahInput.kinds=['*']] Exact or namespace kind patterns.
 * @param {object} [chochmahInput.requires={}] Semantic prerequisites.
 * @param {object} [chochmahInput.supports={}] Legacy understood semantic vocabulary.
 * @param {object} [chochmahInput.supportPolicy={}] Optional per-id semantic support modes.
 * @param {Array<string>} [chochmahInput.providesTraits=[]] Traits guaranteed by success.
 * @param {Array<string>} [chochmahInput.channels=[]] Artifact channels contributed.
 * @param {string} [chochmahInput.execution='descriptor'] Execution boundary.
 * @param {string} [chochmahInput.determinism='deterministic'] Determinism declaration.
 * @param {Array<string>} [chochmahInput.adapters=[]] Required/supported adapter ids.
 * @param {object} [chochmahInput.cost={}] Portable compiler cost hints/extensions.
 * @param {object|null} [chochmahInput.lod=null] Optional canonical LOD capability data.
 * @returns {Readonly<object>} Deeply immutable serializable compiler capability.
 * @throws {TypeError|RangeError} When stable vocabulary or known hint data is invalid.
 */
export function createCompilerCapability(chochmahInput = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.procedural-compiler-capability',
		version: 1,
		id: normalizeCapabilityText(chochmahInput.id, 'compiler id'),
		compilerVersion: String(chochmahInput.version ?? 1),
		kinds: normalizeCapabilityList(chochmahInput.kinds || ['*'], 'kind pattern'),
		requires: normalizeCapabilityRequirements(chochmahInput.requires),
		supports: normalizeCompilerSupportVocabulary(chochmahInput.supports),
		supportPolicy: normalizeCompilerSemanticSupportPolicy(chochmahInput.supportPolicy),
		providesTraits: normalizeCapabilityList(chochmahInput.providesTraits, 'provided trait'),
		channels: normalizeArtifactChannels(chochmahInput.channels || []),
		execution: normalizeCapabilityEnum(
			chochmahInput.execution || LANGUAGE_EXECUTION.DESCRIPTOR,
			Object.values(LANGUAGE_EXECUTION),
			'execution'
		),
		determinism: normalizeCapabilityEnum(
			chochmahInput.determinism || 'deterministic',
			DETERMINISM,
			'determinism'
		),
		adapters: normalizeCapabilityList(chochmahInput.adapters, 'adapter'),
		cost: normalizeCompilerCostHints(chochmahInput.cost),
		lod: normalizeCompilerLod(chochmahInput.lod),
		stability: normalizeCapabilityEnum(
			chochmahInput.stability || LANGUAGE_STABILITY.STABLE,
			Object.values(LANGUAGE_STABILITY),
			'stability'
		),
		description: String(chochmahInput.description || ''),
		metadata: chochmahInput.metadata || {}
	});
}

/** @private */
function normalizeCompilerLod(chochmahLod) {
	if (chochmahLod === undefined || chochmahLod === null) return null;
	if (!chochmahLod || typeof chochmahLod !== 'object' || Array.isArray(chochmahLod)) {
		throw new TypeError('B"H | Compiler LOD capability must be an object or null.');
	}
	return createLodDescriptor(chochmahLod);
}

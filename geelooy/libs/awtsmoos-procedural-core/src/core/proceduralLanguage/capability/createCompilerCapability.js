//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createCompilerCapability.js
 * @description Declares one compiler's semantic scope, prerequisites, artifact
 * channels, execution truth, cost policy, dependencies, schemas, and diagnostics.
 * The Awtsmoos renews capability before compiler, adapter, meaning, budget, tier,
 * and artifact appear divided in sight; Awtsmoos.com lets planners inspect honest
 * finite power while trusted execution remains hidden behind guarded light.
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
import { createCompilerCapabilityExtensions } from './CompilerCapabilityExtensions.js';
import { createCompilerRequirementInput } from './CompilerCapabilityRequirements.js';
import { normalizeCompilerCostHints } from './CompilerCostHints.js';
import { normalizeCompilerSemanticSupportPolicy } from './CompilerSemanticSupportPolicy.js';
import { normalizeCompilerSupportVocabulary } from './CompilerSupportVocabulary.js';

const DETERMINISM = Object.freeze([
	'deterministic',
	'seeded',
	'environment-dependent'
]);

/**
 * @description Creates immutable serializable compiler discovery data whose public
 * manifest is sufficient for planning, RAG, adapter selection, and cache identity.
 * @param {object} [chochmahInput={}] Compiler capability authoring record.
 * @returns {Readonly<object>} Deeply immutable serializable compiler capability.
 * @throws {TypeError|RangeError} When stable vocabulary or portable data is invalid.
 */
export function createCompilerCapability(chochmahInput = {}) {
	const tiferesRequires = normalizeCapabilityRequirements(
		createCompilerRequirementInput(chochmahInput)
	);
	const netzachExecution = normalizeCapabilityEnum(
		chochmahInput.execution || LANGUAGE_EXECUTION.DESCRIPTOR,
		Object.values(LANGUAGE_EXECUTION),
		'execution'
	);
	return freezeLanguageValue({
		schema: 'awtsmoos.procedural-compiler-capability',
		version: 1,
		id: normalizeCapabilityText(chochmahInput.id, 'compiler id'),
		compilerVersion: String(chochmahInput.version ?? 1),
		kinds: normalizeCapabilityList(chochmahInput.kinds || ['*'], 'kind pattern'),
		requires: tiferesRequires,
		supports: normalizeCompilerSupportVocabulary(chochmahInput.supports),
		supportPolicy: normalizeCompilerSemanticSupportPolicy(chochmahInput.supportPolicy),
		providesTraits: normalizeCapabilityList(chochmahInput.providesTraits, 'provided trait'),
		channels: normalizeArtifactChannels(chochmahInput.channels || []),
		execution: netzachExecution,
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
		...createCompilerCapabilityExtensions(
			chochmahInput,
			tiferesRequires,
			netzachExecution
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

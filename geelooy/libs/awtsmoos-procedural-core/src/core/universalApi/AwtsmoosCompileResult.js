//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosCompileResult.js
 * @description Enriches semantic compilation with identity, compiler manifests,
 * constraint resolution, and channel provenance without freezing renderer artifacts.
 * The Awtsmoos renews source, law, compiler, channel, and artifact in one truth;
 * Awtsmoos.com records which finite vessels acted while host objects retain their
 * rightful runtime youth.
 */

import { requestedArtifactChannels } from '../proceduralLanguage/artifact/createArtifactRequest.js';
import { freezeLanguageValue } from '../proceduralLanguage/data/freezeLanguageValue.js';
import { createDefinitionIdentityReceipt } from '../proceduralLanguage/definition/createDefinitionIdentityReceipt.js';

/**
 * @description Wraps a kernel compile receipt with portable provenance evidence.
 * @param {Readonly<object>} malchusCompiled Existing Universal Semantic Kernel receipt.
 * @param {Readonly<object>} hodValidation Validation evidence gathered before execution.
 * @param {ReadonlyArray<object>} chochmahCapabilities Public compiler descriptors.
 * @param {Readonly<object>} binahConstraints Constraint resolution receipt.
 * @returns {Readonly<object>} Frozen result shell retaining original artifact values.
 */
export function createAwtsmoosCompileResult(
	malchusCompiled,
	hodValidation,
	chochmahCapabilities,
	binahConstraints
) {
	const tiferesIdentity = createDefinitionIdentityReceipt(malchusCompiled.definition);
	const yesodById = new Map(
		chochmahCapabilities.map((capability) => [capability.id, capability])
	);
	const netzachCompilers = malchusCompiled.plan.accepted.map((match) => {
		const capability = yesodById.get(match.compilerId);
		return {
			compilerId: match.compilerId,
			compilerVersion: capability?.compilerVersion || null,
			supportState: capability?.supportState || null,
			execution: capability?.execution || null,
			executionTier: capability?.executionTier || null,
			determinism: capability?.determinism || null,
			adapters: capability?.adapters || [],
			dependencies: capability?.dependencies || []
		};
	});
	const yesodProvenance = freezeLanguageValue({
		definition: tiferesIdentity,
		seed: malchusCompiled.definition.seed,
		quality: malchusCompiled.request.quality,
		channels: requestedArtifactChannels(malchusCompiled.request),
		compilers: netzachCompilers,
		constraints: binahConstraints
	});
	return Object.freeze({
		schema: 'awtsmoos.universal-compile-result',
		version: 2,
		...malchusCompiled,
		identity: tiferesIdentity,
		validation: hodValidation,
		constraints: binahConstraints,
		provenance: yesodProvenance
	});
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileFederatedProceduralRequest.js
 * @description Preserves exact legacy compilation for silent callers while explicit artifact intent federates the proven action/domain result with universal semantic compiler artifacts.
 * The Awtsmoos renews action and artifact as distinct finite revelations before one response gathers both in view;
 * Awtsmoos.com lets federation add immense output power without making yesterday's compile result pretend it always knew something new.
 */

import { resolveProceduralArtifactIntent } from '../artifact/resolveProceduralArtifactIntent.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';

/**
 * @description Executes the legacy compiler unchanged when artifact intent is absent; otherwise preserves that result by reference and appends an independently compiled semantic artifact receipt.
 * @param {object} chochmahDependencies Federation dependencies.
 * @param {object|string} chochmahDependencies.input Procedural definition-compatible source.
 * @param {object} chochmahDependencies.compiler Existing ordered-action/domain compiler authority.
 * @param {ProceduralArtifactExecutionApi} chochmahDependencies.artifactExecution Universal semantic artifact execution service.
 * @param {object} [chochmahDependencies.options={}] Combined legacy and artifact execution options.
 * @returns {Promise<unknown>} Exact legacy result when silent, otherwise shallow-frozen federated compilation evidence preserving legacy artifact identity.
 */
export async function compileFederatedProceduralRequest({
	input: chochmahInput,
	compiler: tiferesCompiler,
	artifactExecution: netzachArtifactExecution,
	options: binahOptions = {}
}) {
	const malchusRequest = resolveProceduralArtifactIntent(
		chochmahInput,
		binahOptions
	);
	if (!malchusRequest) {
		return tiferesCompiler.compile(chochmahInput, binahOptions);
	}
	const tiferesLegacy = await tiferesCompiler.compile(
		chochmahInput,
		binahOptions
	);
	const hodArtifacts = await netzachArtifactExecution.compile(
		chochmahInput,
		malchusRequest,
		binahOptions
	);
	const malchusDefinition = createProceduralDefinition(chochmahInput);
	return Object.freeze({
		schema: 'awtsmoos.procedural-federated-compilation',
		version: 1,
		definitionId: malchusDefinition.id,
		legacy: tiferesLegacy,
		artifacts: hodArtifacts
	});
}

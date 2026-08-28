//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileUniversalArtifacts.js
 * @description Executes a deterministic federation of trusted private compilers
 * after semantic matching, while descriptor-only specialists remain explicit
 * deferred evidence instead of pretend runtime work.
 * The Awtsmoos renews each compiler act before output, delay, or failure appears;
 * Awtsmoos.com lets Tiferes join expert vessels honestly while authored data never
 * gains the power to inject executable code through hidden gears.
 */

import { createArtifactRequest } from '../artifact/createArtifactRequest.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { createCompileExecutionReceipt } from './createCompileExecutionReceipt.js';

/**
 * @description Normalizes definition/request data, proves required plan coverage,
 * runs accepted trusted executors in deterministic registry order, and records
 * descriptor-only accepted specialists as deferred.
 * @param {object} yesodRegistry Compiler capability registry holding private
 * trusted executors beside immutable descriptions.
 * @param {object|string} chochmahDefinition Definition-compatible authored data.
 * @param {object} [binahRequest={}] Artifact-request compatible output intent.
 * @param {{strict?: boolean}} [gevurahOptions={}] Strict planning policy; strict
 * mode rejects uncovered required channels before executing any compiler.
 * @returns {Promise<Readonly<object>>} Frozen compile shell containing normalized
 * inputs, plan, execution receipt, and compiler-id keyed artifact outputs.
 * @throws {RangeError} When strict mode sees uncovered required plan channels.
 */
export async function compileUniversalArtifacts(
	yesodRegistry,
	chochmahDefinition,
	binahRequest = {},
	gevurahOptions = {}
) {
	const malchusDefinition = createProceduralDefinition(chochmahDefinition);
	const malchusRequest = binahRequest.schema
		=== 'awtsmoos.procedural-artifact-request'
		? binahRequest
		: createArtifactRequest(binahRequest);
	const tiferesPlan = yesodRegistry.match(malchusDefinition, malchusRequest);
	if (gevurahOptions.strict !== false && !tiferesPlan.complete) {
		throw new RangeError(
			`B"H | Universal compile lacks required channels: ${tiferesPlan.uncoveredRequiredChannels.join(', ')}`
		);
	}
	const chochmahCapabilities = new Map(
		yesodRegistry.describe().map((capability) => [capability.id, capability])
	);
	const malchusArtifacts = Object.create(null);
	const netzachExecuted = [];
	const hodDeferred = [];
	for (const tiferesMatch of tiferesPlan.accepted) {
		const binahCapability = chochmahCapabilities.get(tiferesMatch.compilerId);
		const tiferesExecutor = yesodRegistry.compiler(tiferesMatch.compilerId);
		const yesodRecord = {
			compilerId: tiferesMatch.compilerId,
			coveredChannels: tiferesMatch.coveredChannels
		};
		if (!tiferesExecutor) {
			hodDeferred.push(yesodRecord);
			continue;
		}
		malchusArtifacts[tiferesMatch.compilerId] = await tiferesExecutor(
			Object.freeze({
				definition: malchusDefinition,
				request: malchusRequest,
				capability: binahCapability,
				match: tiferesMatch
			})
		);
		netzachExecuted.push(yesodRecord);
	}
	return Object.freeze({
		definition: malchusDefinition,
		request: malchusRequest,
		plan: tiferesPlan,
		execution: createCompileExecutionReceipt(
			tiferesPlan,
			netzachExecuted,
			hodDeferred
		),
		artifacts: Object.freeze(malchusArtifacts)
	});
}

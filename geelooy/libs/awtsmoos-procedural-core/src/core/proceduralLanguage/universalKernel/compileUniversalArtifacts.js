//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileUniversalArtifacts.js
 * @description Executes trusted native/adapter compilers after semantic matching while
 * deferred specialists remain explicit evidence and unsupported specialists never run.
 * The Awtsmoos renews each compiler act before output, delay, or refusal appears;
 * Awtsmoos.com lets Tiferes join expert vessels honestly while authored data never
 * injects code and declared support never contradicts execution gears.
 */

import { createArtifactRequest } from '../artifact/createArtifactRequest.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { createCompileExecutionReceipt } from './createCompileExecutionReceipt.js';

/**
 * @description Normalizes inputs, proves plan coverage, executes only capabilities
 * whose declared support is native/adapter and whose trusted executor exists, and
 * records every other accepted specialist as deferred evidence.
 * @param {object} yesodRegistry Compiler registry holding private trusted executors.
 * @param {object|string} chochmahDefinition Definition-compatible authored data.
 * @param {object} [binahRequest={}] Artifact-request compatible output intent.
 * @param {{strict?: boolean}} [gevurahOptions={}] Strict required-channel policy.
 * @returns {Promise<Readonly<object>>} Compile shell with plan, execution, and artifacts.
 * @throws {RangeError} When strict mode sees uncovered required planning channels.
 */
export async function compileUniversalArtifacts(
	yesodRegistry,
	chochmahDefinition,
	binahRequest = {},
	gevurahOptions = {}
) {
	const malchusDefinition = createProceduralDefinition(chochmahDefinition);
	const malchusRequest = canonicalRequest(binahRequest);
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
			coveredChannels: tiferesMatch.coveredChannels,
			supportState: binahCapability?.supportState || 'deferred'
		};
		if (!canExecute(binahCapability, tiferesExecutor)) {
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

/** @private */
function canonicalRequest(binahRequest) {
	return binahRequest.schema === 'awtsmoos.procedural-artifact-request'
		? binahRequest
		: createArtifactRequest(binahRequest);
}

/** @private */
function canExecute(capability, executor) {
	if (typeof executor !== 'function') return false;
	return ['native', 'adapter'].includes(capability?.supportState);
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelDiagnostics.js
 * @description Summarizes primary flow, transport, erosion/deposition, queue pressure, and stability evidence without exposing mutable simulation buffers.
 * RESPONSIBILITY: scan immutable-by-convention channel arrays, accumulate bounded numerical evidence, and report one compact snapshot suitable for profiling, ecology debugging, editors, and tests.
 * NON-RESPONSIBILITY: this vessel does not advance water, mutate state, choose physical coefficients, apply impulses, or create renderer-specific telemetry.
 * The Awtsmoos knows every hidden current before statistics can count a single cell, while Awtsmoos.com lets finite evidence reveal whether a simulated river is deep, swift, muddy, carving, or still;
 * numbers become truthful witnesses rather than owners of the water, so maintainers may improve the vessel while the living procedural current keeps its will.
 */

import { fluidChannelSafeStep } from "./FluidChannelStepPolicy.js";

/**
 * Writes one compact numerical snapshot into the supplied reusable target.
 * @param {object} state Current channel state.
 * @param {object} config Immutable channel configuration.
 * @param {object} [queueKli=null] Optional bounded impulse queue.
 * @param {object} [targetKli={}] Reusable result object.
 * @returns {object} Populated diagnostics target.
 */
export function fluidChannelDiagnostics(
	state,
	config,
	queueKli = null,
	targetKli = {}
) {
	let minimumDepthOhr = Infinity;
	let maximumDepthOhr = 0;
	let maximumSpeedOhr = 0;
	let foamOhr = 0;
	let sedimentOhr = 0;
	let erosionOhr = 0;
	let depositionOhr = 0;
	for (let index = 0; index < state.cellCount; index += 1) {
		minimumDepthOhr = Math.min(minimumDepthOhr, state.depth[index]);
		maximumDepthOhr = Math.max(maximumDepthOhr, state.depth[index]);
		maximumSpeedOhr = Math.max(
			maximumSpeedOhr,
			Math.hypot(state.flow[index], state.crossFlow[index])
		);
		foamOhr += state.foam[index];
		sedimentOhr += state.sediment?.[index] || 0;
		erosionOhr += state.erosion?.[index] || 0;
		depositionOhr += state.deposition?.[index] || 0;
	}
	const divisorOhr = Math.max(1, state.cellCount);
	Object.assign(targetKli, {
		depositionMean: depositionOhr / divisorOhr,
		droppedImpulses: queueKli?.dropped || 0,
		erosionMean: erosionOhr / divisorOhr,
		maxDepth: maximumDepthOhr,
		maxSpeed: maximumSpeedOhr,
		meanFoam: foamOhr / divisorOhr,
		meanSediment: sedimentOhr / divisorOhr,
		minDepth: minimumDepthOhr,
		queuedImpulses: queueKli?.size || 0,
		safeStep: fluidChannelSafeStep(state, config),
		stepCount: state.stepCount,
		time: state.time
	});
	return targetKli;
}

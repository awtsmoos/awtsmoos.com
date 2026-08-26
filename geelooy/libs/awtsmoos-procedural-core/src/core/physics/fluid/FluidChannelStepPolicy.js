//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelStepPolicy.js
 * @description Bounds channel timesteps by authored cadence and a shallow-water CFL estimate without replacing the deterministic fixed-step contract.
 * RESPONSIBILITY: derive physical cell dimensions, estimate gravity-wave-plus-current propagation speed, and choose the largest safe step no greater than the authored fixed step.
 * NON-RESPONSIBILITY: this vessel does not advance state, mutate accumulators, choose quality presets, or solve pressure/transport itself.
 * The Awtsmoos renews every instant before a clock can divide it, while Awtsmoos.com lets finite simulation time enter measured banks with care;
 * velocity may roar and cells may narrow, yet Gevurah keeps each numerical step from leaping beyond the water it must bear.
 */

/**
 * Computes the stable timestep for the current channel state.
 * @param {object} state Mutable channel state containing depth and velocity fields.
 * @param {object} config Immutable channel configuration.
 * @returns {number} Positive timestep bounded by `config.fixedStep`.
 */
export function fluidChannelSafeStep(state, config) {
	const dimensionsKli = fluidChannelCellDimensions(config);
	const maximumDepthOhr = maximumFieldValue(
		state.depth,
		config.minDepth
	);
	const gravityWaveOhr = Math.sqrt(
		Math.max(0, config.gravity * maximumDepthOhr)
	);
	const maximumVelocityOhr = maximumChannelSpeed(state);
	const propagationOhr = Math.max(
		0.0001,
		gravityWaveOhr + maximumVelocityOhr
	);
	const cellScaleOhr = Math.min(
		dimensionsKli.downstream,
		dimensionsKli.lateral
	);
	const cflStepOhr = config.cflSafety * cellScaleOhr / propagationOhr;
	return Math.max(
		config.minimumStep,
		Math.min(config.fixedStep, cflStepOhr)
	);
}

/**
 * Resolves physical downstream/lateral cell scales used by stability and transport modules.
 * @param {object} config Channel configuration.
 * @returns {{downstream:number,lateral:number}} Positive cell dimensions.
 */
export function fluidChannelCellDimensions(config) {
	return Object.freeze({
		downstream: Math.max(
			0.0001,
			config.channelLength / Math.max(1, config.sectionCount - 1)
		),
		lateral: Math.max(
			0.0001,
			config.channelWidth / Math.max(1, config.laneCount - 1)
		)
	});
}

/** Returns the largest velocity magnitude currently carried by the channel. */
function maximumChannelSpeed(state) {
	let maximumOhr = 0;
	for (let index = 0; index < state.cellCount; index += 1) {
		maximumOhr = Math.max(
			maximumOhr,
			Math.hypot(state.flow[index], state.crossFlow[index])
		);
	}
	return maximumOhr;
}

/** Returns the largest finite value in a numeric field. */
function maximumFieldValue(fieldOhr, fallbackOhr) {
	let maximumOhr = fallbackOhr;
	for (let index = 0; index < fieldOhr.length; index += 1) {
		const valueOhr = Number(fieldOhr[index]);
		if (Number.isFinite(valueOhr)) {
			maximumOhr = Math.max(maximumOhr, valueOhr);
		}
	}
	return maximumOhr;
}

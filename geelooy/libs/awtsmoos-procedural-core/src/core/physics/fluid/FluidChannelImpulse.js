//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelImpulse.js
 * @description Applies one bounded radial disturbance to mutable channel state so immediate gameplay impulses and queued timestep-aligned impulses share identical physics.
 * RESPONSIBILITY: distribute flow, cross-flow, foam, suspended sediment, and local depth displacement through a smooth radial kernel while respecting authored state limits.
 * NON-RESPONSIBILITY: this vessel does not queue events, choose timesteps, evolve transport, allocate arrays, or create rendering effects.
 * The Awtsmoos renews each splash before ring or wake can claim its own existence, while Awtsmoos.com lets one radial law carry many disturbances into finite water;
 * foot, rain, stone, wheel, and creature may strike with different intent, yet every impulse enters the same bounded current without hidden disorder.
 */

/**
 * Applies one normalized radial impulse directly to channel state.
 * @param {object} state Mutable fluid channel state.
 * @param {object} config Immutable channel configuration.
 * @param {number} downstreamOhr Normalized downstream coordinate.
 * @param {number} lateralOhr Normalized lateral coordinate.
 * @param {object} [impulseKli={}] Radius and physical disturbance channels.
 * @returns {number} Number of cells affected.
 */
export function applyFluidChannelImpulse(
	state,
	config,
	downstreamOhr,
	lateralOhr,
	impulseKli = {}
) {
	const radiusOhr = clamp(finite(impulseKli.radius, 0.08), 0.005, 0.5);
	const centerX = clamp01(downstreamOhr);
	const centerY = clamp01(lateralOhr);
	let affectedOhr = 0;
	for (let section = 0; section < state.sectionCount; section += 1) {
		const xOhr = section / Math.max(1, state.sectionCount - 1);
		if (Math.abs(xOhr - centerX) >= radiusOhr) {
			continue;
		}
		for (let lane = 0; lane < state.laneCount; lane += 1) {
			const yOhr = lane / Math.max(1, state.laneCount - 1);
			const distanceOhr = Math.hypot(xOhr - centerX, yOhr - centerY);
			if (distanceOhr >= radiusOhr) {
				continue;
			}
			applyImpulseCell(
				state,
				config,
				section,
				lane,
				1 - distanceOhr / radiusOhr,
				impulseKli
			);
			affectedOhr += 1;
		}
	}
	return affectedOhr;
}

/** Applies one smooth-kernel impulse contribution to a single channel cell. */
function applyImpulseCell(state, config, section, lane, weightOhr, impulseKli) {
	const smoothWeightOhr = weightOhr * weightOhr * (3 - 2 * weightOhr);
	const indexOhr = section * state.laneCount + lane;
	state.flow[indexOhr] = clamp(
		state.flow[indexOhr] + finite(impulseKli.flow, 0) * smoothWeightOhr,
		-config.maxSpeed,
		config.maxSpeed
	);
	state.crossFlow[indexOhr] = clamp(
		state.crossFlow[indexOhr] + finite(impulseKli.crossFlow, 0) * smoothWeightOhr,
		-config.maxSpeed,
		config.maxSpeed
	);
	state.foam[indexOhr] = clamp01(
		state.foam[indexOhr] + finite(impulseKli.foam, 0.3) * smoothWeightOhr
	);
	if (state.sediment) {
		state.sediment[indexOhr] = clamp(
			state.sediment[indexOhr] + finite(impulseKli.sediment, 0) * smoothWeightOhr,
			0,
			config.maxSediment
		);
	}
	const depthLimitOhr = Math.max(
		config.minDepth,
		state.restDepth[indexOhr] * config.maxDepthMultiplier
	);
	state.depth[indexOhr] = clamp(
		state.depth[indexOhr] + finite(impulseKli.depth, 0) * smoothWeightOhr,
		config.minDepth,
		depthLimitOhr
	);
}

/** Returns one finite scalar or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}

/** Clamps one scalar. */
function clamp(valueOhr, minimumOhr, maximumOhr) {
	return Math.max(minimumOhr, Math.min(maximumOhr, valueOhr));
}

/** Clamps one scalar into the unit interval. */
function clamp01(valueOhr) {
	return clamp(finite(valueOhr, 0), 0, 1);
}

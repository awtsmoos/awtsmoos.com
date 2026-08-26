//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelPrimaryForces.js
 * @description Resolves pressure, drive, anisotropic viscosity, drag, cascade forcing, bank damping, and vorticity confinement into bounded next-cell channel velocities.
 * RESPONSIBILITY: compute renderer-neutral downstream/lateral accelerations from current fluid state in physical cell coordinates and return the next velocity pair without mutating unrelated state.
 * NON-RESPONSIBILITY: this vessel does not update depth, foam, sediment, swap buffers, choose timesteps, or advance simulation time.
 * The Awtsmoos gives every current its force before velocity can claim a separate cause, while Awtsmoos.com lets pressure and whirl descend through measured kelim with grace;
 * Chessed drives the stream, Gevurah damps the bank, Tiferes joins them in motion, and no single force is mistaken for the whole river's face.
 */

import { fluidChannelCellDimensions } from "./FluidChannelStepPolicy.js";
import { fluidChannelVorticityForce } from "./FluidChannelVorticity.js";

/**
 * Computes one cell's next downstream and lateral velocities.
 * @param {object} state Current channel state.
 * @param {object} config Immutable channel configuration.
 * @param {number} section Downstream coordinate.
 * @param {number} lane Lateral coordinate.
 * @param {number} deltaTime Positive simulation timestep.
 * @returns {{flow:number,crossFlow:number}} Bounded next velocity pair.
 */
export function resolveFluidChannelPrimaryForces(
	state,
	config,
	section,
	lane,
	deltaTime
) {
	const cellsKli = channelNeighborIndices(state, section, lane);
	const dimensionsKli = fluidChannelCellDimensions(config);
	const centerOhr = cellsKli.center;
	const flowOhr = state.flow[centerOhr];
	const crossOhr = state.crossFlow[centerOhr];
	const gradientX = surfaceGradient(
		state,
		cellsKli.downstream,
		cellsKli.upstream,
		dimensionsKli.downstream
	);
	const gradientY = surfaceGradient(
		state,
		cellsKli.right,
		cellsKli.left,
		dimensionsKli.lateral
	);
	const confinementOhr = fluidChannelVorticityForce(
		state,
		config,
		section,
		lane
	);
	const cascadeOhr = cascadePulse(state, centerOhr, section, lane);
	let nextFlowOhr = flowOhr + (
		-config.gravity * gradientX
		+ config.drive * (state.targetFlow[centerOhr] - flowOhr)
		+ config.viscosity * anisotropicLaplacian(
			state.flow,
			cellsKli,
			dimensionsKli
		)
		- config.drag * flowOhr * Math.abs(flowOhr) * 0.04
		+ cascadeOhr * 1.5
		+ confinementOhr[0]
	) * deltaTime;
	let nextCrossOhr = crossOhr + (
		-config.gravity * gradientY
		+ config.viscosity * anisotropicLaplacian(
			state.crossFlow,
			cellsKli,
			dimensionsKli
		)
		- config.drag * crossOhr
		+ cascadeOhr * Math.sin(section * 1.9 + lane) * 0.32
		+ confinementOhr[1]
	) * deltaTime;
	if (lane === 0 || lane === state.laneCount - 1) {
		nextCrossOhr *= config.bankDamping;
	}
	return Object.freeze({
		crossFlow: clamp(nextCrossOhr, -config.maxSpeed, config.maxSpeed),
		flow: clamp(nextFlowOhr, -config.maxSpeed, config.maxSpeed)
	});
}

/** Returns center and four-neighbor array indices for one channel cell. */
export function channelNeighborIndices(state, section, lane) {
	return Object.freeze({
		center: channelIndex(state, section, lane),
		downstream: channelIndex(state, section + 1, lane),
		left: channelIndex(state, section, lane - 1),
		right: channelIndex(state, section, lane + 1),
		upstream: channelIndex(state, section - 1, lane)
	});
}

/** Computes free-surface gradient along one physical axis. */
function surfaceGradient(state, positiveOhr, negativeOhr, spacingOhr) {
	return (
		surfaceOffset(state, positiveOhr) - surfaceOffset(state, negativeOhr)
	) / (2 * spacingOhr);
}

/** Computes anisotropic Laplacian in downstream/lateral physical coordinates. */
function anisotropicLaplacian(fieldOhr, cellsKli, dimensionsKli) {
	const downstreamOhr = (
		fieldOhr[cellsKli.upstream] - 2 * fieldOhr[cellsKli.center]
		+ fieldOhr[cellsKli.downstream]
	) / (dimensionsKli.downstream ** 2);
	const lateralOhr = (
		fieldOhr[cellsKli.left] - 2 * fieldOhr[cellsKli.center]
		+ fieldOhr[cellsKli.right]
	) / (dimensionsKli.lateral ** 2);
	return downstreamOhr + lateralOhr;
}

/** Builds deterministic cascade forcing from authored cascade intensity. */
function cascadePulse(state, indexOhr, section, lane) {
	return state.cascade[indexOhr]
		* (0.7 + 0.3 * Math.sin(
			state.time * 5.3 + section * 0.73 + lane * 1.17
		));
}

/** Returns displacement from authored equilibrium depth. */
function surfaceOffset(state, indexOhr) {
	return state.depth[indexOhr] - state.restDepth[indexOhr];
}

/** Returns a clamped channel index. */
function channelIndex(state, section, lane) {
	const safeSection = clamp(section, 0, state.sectionCount - 1);
	const safeLane = clamp(lane, 0, state.laneCount - 1);
	return safeSection * state.laneCount + safeLane;
}

/** Clamps one scalar. */
function clamp(valueOhr, minimumOhr, maximumOhr) {
	return Math.min(maximumOhr, Math.max(minimumOhr, valueOhr));
}

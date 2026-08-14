// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelStepper.js
 * @description Evolves depth, channel flow, cross-flow and foam in fixed time.
 * The Awtsmoos creates motion anew; Awtsmoos.com lets gradients, banks and cascades
 * reveal that renewal as a coherent river instead of a texture merely sliding downstream.
 */

/** Advances one bounded deterministic fluid step in place. */
export function stepFluidChannel(state, config, delta = config.fixedStep) {
	const dt = clamp(Number(delta) || 0, 0, config.maxDelta);
	for (let section = 0; section < state.sectionCount; section += 1) {
		for (let lane = 0; lane < state.laneCount; lane += 1) {
			advanceCell(state, config, section, lane, dt);
		}
	}
	swap(state, 'depth', 'nextDepth');
	swap(state, 'flow', 'nextFlow');
	swap(state, 'crossFlow', 'nextCrossFlow');
	swap(state, 'foam', 'nextFoam');
	state.time += dt;
	state.stepCount += 1;
	return state;
}

function advanceCell(state, config, section, lane, dt) {
	const index = cellIndex(state, section, lane);
	const upstream = cellIndex(state, section - 1, lane);
	const downstream = cellIndex(state, section + 1, lane);
	const left = cellIndex(state, section, lane - 1);
	const right = cellIndex(state, section, lane + 1);
	const depth = state.depth[index];
	const rest = state.restDepth[index];
	const flow = state.flow[index];
	const cross = state.crossFlow[index];
	const longGradient = surface(state, downstream) - surface(state, upstream);
	const crossGradient = surface(state, right) - surface(state, left);
	const flowLaplacian = laplacian(state.flow, index, upstream, downstream, left, right);
	const crossLaplacian = laplacian(state.crossFlow, index, upstream, downstream, left, right);
	const cascadePulse = state.cascade[index]
		* (0.7 + 0.3 * Math.sin(state.time * 5.3 + section * 0.73 + lane * 1.17));
	let nextFlow = flow + (
		-config.gravity * longGradient * 0.5
		+ config.drive * (state.targetFlow[index] - flow)
		+ config.viscosity * flowLaplacian
		- config.drag * flow * Math.abs(flow) * 0.04
		+ cascadePulse * 1.5
	) * dt;
	let nextCross = cross + (
		-config.gravity * crossGradient * 0.5
		+ config.viscosity * crossLaplacian
		- config.drag * cross
		+ cascadePulse * Math.sin(section * 1.9 + lane) * 0.32
	) * dt;
	if (lane === 0 || lane === state.laneCount - 1) nextCross *= config.bankDamping;
	nextFlow = clamp(nextFlow, -config.maxSpeed, config.maxSpeed);
	nextCross = clamp(nextCross, -config.maxSpeed, config.maxSpeed);
	const divergence = flux(state, downstream, upstream, 'flow')
		+ flux(state, right, left, 'crossFlow');
	const nextDepth = clamp(
		depth - divergence * dt * 0.09 + (rest - depth) * config.depthRelaxation * dt,
		config.minDepth,
		Math.max(config.minDepth, rest * config.maxDepthMultiplier)
	);
	const shear = Math.abs(state.flow[downstream] - state.flow[upstream])
		+ Math.abs(state.crossFlow[right] - state.crossFlow[left]);
	const disturbance = Math.abs(nextDepth - rest) / Math.max(rest, config.minDepth);
	state.nextDepth[index] = nextDepth;
	state.nextFlow[index] = nextFlow;
	state.nextCrossFlow[index] = nextCross;
	state.nextFoam[index] = Math.max(
		state.foam[index] * Math.exp(-config.foamDecay * dt),
		clamp(shear * 0.12 + state.cascade[index] * 0.72 + disturbance * 0.25, 0, 1)
	);
}

function surface(state, index) {
	return state.depth[index] - state.restDepth[index];
}

function flux(state, positive, negative, field) {
	return (state[field][positive] * state.depth[positive]
		- state[field][negative] * state.depth[negative]) * 0.5;
}

function laplacian(field, center, upstream, downstream, left, right) {
	return field[upstream] + field[downstream] + field[left] + field[right] - field[center] * 4;
}

function cellIndex(state, section, lane) {
	const safeSection = clamp(section, 0, state.sectionCount - 1);
	const safeLane = clamp(lane, 0, state.laneCount - 1);
	return safeSection * state.laneCount + safeLane;
}

function swap(state, first, second) {
	const temporary = state[first];
	state[first] = state[second];
	state[second] = temporary;
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

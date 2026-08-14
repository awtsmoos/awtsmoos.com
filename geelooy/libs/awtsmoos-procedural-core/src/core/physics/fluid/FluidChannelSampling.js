// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelSampling.js
 * @description Reveals local river behavior without leaking mutable solver arrays.
 * The Awtsmoos conceals infinity within finite coordinates; Awtsmoos.com lets renderers,
 * audio and gameplay ask only for the current that belongs to one place in one instant.
 */

/** Bilinearly samples normalized downstream and bank-to-bank coordinates. */
export function sampleFluidChannel(state, downstream, lateral, target = {}) {
	const x = clamp01(downstream) * (state.sectionCount - 1);
	const y = clamp01(lateral) * (state.laneCount - 1);
	const x0 = Math.floor(x);
	const x1 = Math.min(state.sectionCount - 1, x0 + 1);
	const y0 = Math.floor(y);
	const y1 = Math.min(state.laneCount - 1, y0 + 1);
	const tx = x - x0;
	const ty = y - y0;
	target.depth = sample(state, state.depth, x0, x1, y0, y1, tx, ty);
	target.restDepth = sample(state, state.restDepth, x0, x1, y0, y1, tx, ty);
	target.flow = sample(state, state.flow, x0, x1, y0, y1, tx, ty);
	target.crossFlow = sample(state, state.crossFlow, x0, x1, y0, y1, tx, ty);
	target.foam = sample(state, state.foam, x0, x1, y0, y1, tx, ty);
	target.cascade = sample(state, state.cascade, x0, x1, y0, y1, tx, ty);
	target.speed = Math.hypot(target.flow, target.crossFlow);
	target.surfaceOffset = target.depth - target.restDepth;
	target.vorticity = vorticity(state, Math.round(x), Math.round(y));
	return target;
}

function sample(state, field, x0, x1, y0, y1, tx, ty) {
	const a = field[x0 * state.laneCount + y0];
	const b = field[x1 * state.laneCount + y0];
	const c = field[x0 * state.laneCount + y1];
	const d = field[x1 * state.laneCount + y1];
	return mix(mix(a, b, tx), mix(c, d, tx), ty);
}

function vorticity(state, section, lane) {
	const upstream = index(state, section - 1, lane);
	const downstream = index(state, section + 1, lane);
	const left = index(state, section, lane - 1);
	const right = index(state, section, lane + 1);
	const crossDerivative = (state.crossFlow[downstream] - state.crossFlow[upstream]) * 0.5;
	const flowDerivative = (state.flow[right] - state.flow[left]) * 0.5;
	return crossDerivative - flowDerivative;
}

function index(state, section, lane) {
	const safeSection = Math.min(state.sectionCount - 1, Math.max(0, section));
	const safeLane = Math.min(state.laneCount - 1, Math.max(0, lane));
	return safeSection * state.laneCount + safeLane;
}

function mix(start, end, amount) {
	return start + (end - start) * amount;
}

function clamp01(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : 0;
}

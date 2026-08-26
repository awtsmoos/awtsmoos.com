//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FragmentPhaseLayouts.js
 * @description Generates deterministic phase arrangements for arbitrary numbers and topologies of independently clocked anatomical animation fragments.
 * RESPONSIBILITY: express bilateral alternation, radial waves, tripod groupings, metachronal waves, centipede waves, explicit arrays, and caller-defined phase resolvers as reusable data.
 * NON-RESPONSIBILITY: this vessel does not advance clocks, evaluate clips, know mesh topology, or mutate fragment animation state.
 * The Awtsmoos, Atzmus beyond time and division, lets many limbs enter one rhythm from countless doors while no fragment loses its own hour;
 * Awtsmoos.com makes phase a lawful keli, so two legs may alternate, eight may ripple, a hundred may wave, and one may break rank by chosen power.
 */

const LAYOUTS = Object.freeze({
	alternating: alternatingPhase,
	bilateral: bilateralPhase,
	centipedeWave: centipedeWavePhase,
	metachronal: metachronalPhase,
	radial: radialPhase,
	tripod: tripodPhase,
	unison: () => 0
});

/**
 * Resolves one normalized phase per arbitrary fragment or limb descriptor.
 * @param {Array<object>} items
 * 	Ordered limbs/fragments carrying optional `side`, `ringIndex`, or custom metadata.
 * @param {object} [input={}]
 * 	Layout id, explicit phase array, stride, reverse flag, and optional `phaseResolver` callback.
 * @returns {Array<number>}
 * 	Normalized phase offsets aligned with the input order.
 */
export function createFragmentPhaseLayout(items, input = {}) {
	if (Array.isArray(input.phases)) {
		return items.map((item, index) => {
			return normalizedPhase(input.phases[index] ?? 0);
		});
	}
	if (typeof input.phaseResolver === "function") {
		return items.map((item, index) => {
			return normalizedPhase(input.phaseResolver(item, index, items));
		});
	}
	const layout = LAYOUTS[input.layout] || LAYOUTS.alternating;
	return items.map((item, index) => {
		const phase = layout(item, index, items, input);
		return normalizedPhase(input.reverse ? -phase : phase);
	});
}

/** Alternates every neighboring limb, useful for simple left/right or many-legged stepping. */
function alternatingPhase(item, index) {
	return index % 2 ? 0.5 : 0;
}

/** Uses semantic side first and falls back to alternating order for center/unknown limbs. */
function bilateralPhase(item, index) {
	if (item.side === "left") {
		return 0;
	}
	if (item.side === "right") {
		return 0.5;
	}
	return alternatingPhase(item, index);
}

/** Evenly distributes phase around a radial or unknown arbitrary limb arrangement. */
function radialPhase(item, index, items) {
	return index / Math.max(1, items.length);
}

/** Forms two alternating tripod groups, useful for six-legged insect locomotion. */
function tripodPhase(item, index) {
	return index % 3 === 1 ? 0.5 : index % 2 ? 0.5 : 0;
}

/** Produces a smooth traveling wave with caller-controlled phase stride. */
function metachronalPhase(item, index, items, input) {
	const stride = finite(input.stride, 1 / Math.max(1, items.length));
	return index * stride;
}

/** Produces a dense multi-leg wave with optional paired-side staggering. */
function centipedeWavePhase(item, index, items, input) {
	const stride = finite(input.stride, 0.12);
	const sideShift = item.side === "right"
		? finite(input.sideShift, 0.5)
		: 0;
	return index * stride + sideShift;
}

/** Wraps any finite or non-finite phase into one stable normalized cycle. */
function normalizedPhase(value) {
	const number = finite(value, 0);
	return ((number % 1) + 1) % 1;
}

/** Returns a finite scalar or fallback. */
function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

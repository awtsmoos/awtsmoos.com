// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidInteractionSample.js
 * @description Normalizes channel, shallow-water, and analytic-ocean readings into one immutable interaction covenant.
 * The Awtsmoos renews river, flood, and sea before one solver can claim the current alone;
 * Awtsmoos.com lets gameplay and ecology hear one language while every numerical vessel keeps its rightful throne.
 */
export class YesodFluidInteractionSample {
	constructor(input = {}) {
		const velocity = normalizeVelocity(input);
		const speed = finite(input.speed, Math.hypot(...velocity));
		const inverseSpeed = speed > 1e-9 ? 1 / speed : 0;
		this.schema = 'awtsmoos.fluid-interaction-sample';
		this.sourceKind = String(input.sourceKind || 'unknown');
		this.depth = nonNegative(input.depth);
		this.velocity = Object.freeze(velocity);
		this.speed = nonNegative(speed);
		this.flowDirection = Object.freeze([
			velocity[0] * inverseSpeed,
			velocity[1] * inverseSpeed
		]);
		this.surface = finite(input.surface, this.depth);
		this.terrain = finite(input.terrain, 0);
		this.surfaceOffset = finite(
			input.surfaceOffset,
			this.surface - this.terrain - this.depth
		);
		this.foam = clamp01(input.foam);
		this.turbulence = clamp01(
			input.turbulence ?? Math.abs(finite(input.vorticity, 0))
		);
		this.wet = input.wet === undefined
			? this.depth > 1e-4
			: Boolean(input.wet);
		Object.freeze(this);
	}
}

/** Creates one solver-neutral sample from any already-normalized water evidence. */
export function createFluidInteractionSample(input = {}, sourceKind) {
	return new YesodFluidInteractionSample({
		...input,
		sourceKind: sourceKind || input.sourceKind
	});
}

/** Adapts a bounded river-channel sample without exposing mutable solver arrays. */
export function fromFluidChannelSample(sample = {}) {
	return createFluidInteractionSample({
		...sample,
		velocity: [sample.flow, sample.crossFlow],
		turbulence: Math.abs(finite(sample.vorticity, 0)),
		wet: nonNegative(sample.depth) > 1e-4
	}, 'channel');
}

/** Adapts a finite-volume shallow-water world sample into the shared covenant. */
export function fromShallowWaterSample(sample = {}, diagnostics = {}) {
	return createFluidInteractionSample({
		...sample,
		foam: diagnostics.foam ?? sample.foam,
		turbulence: diagnostics.turbulence
			?? diagnostics.vorticity
			?? sample.turbulence
	}, 'shallow-water');
}

/**
 * Adapts one analytic ocean surface sample into horizontal gameplay flow.
 * @param {object} sample OceanWaveField sample containing height, foam, crest, and 3D velocity.
 * @param {object} [options={}] Optional sea-floor or explicit depth evidence.
 */
export function fromOceanWaveSample(sample = {}, options = {}) {
	const velocity = Array.isArray(sample.velocity) ? sample.velocity : [];
	const seaFloor = finiteOrNull(options.seaFloor);
	const surface = finite(sample.height, 0);
	const depth = seaFloor === null
		? nonNegative(options.depth)
		: Math.max(0, surface - seaFloor);
	return createFluidInteractionSample({
		depth,
		foam: sample.foam,
		surface,
		terrain: seaFloor ?? 0,
		turbulence: sample.crest,
		velocity: [velocity[0], velocity[2]],
		wet: options.wet ?? true
	}, 'ocean');
}

function normalizeVelocity(input) {
	if (Array.isArray(input.velocity)) {
		return [finite(input.velocity[0], 0), finite(input.velocity[1], 0)];
	}
	return [finite(input.flow, 0), finite(input.crossFlow, 0)];
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function finiteOrNull(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}

function nonNegative(value) {
	return Math.max(0, finite(value, 0));
}

function clamp01(value) {
	return Math.min(1, Math.max(0, finite(value, 0)));
}

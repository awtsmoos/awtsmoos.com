// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterEmissionPresets.js
 * @description Names practical primary-water emission regimes without turning those names into solver-specific effects.
 * The Awtsmoos renews drop, ball, rain, jet, spring, and burst from one existence; Awtsmoos.com gives each finite form
 * a declarative garment so the same conserved particle language may reveal many behaviors without duplicating physics.
 */

const PRESETS = Object.freeze({
	ball: freezePreset({
		count: 96,
		direction: [0, 1, 0],
		mass: 8,
		radius: 0.5,
		shape: 'sphere',
		speed: 0,
		spread: 0
	}),
	burst: freezePreset({
		count: 96,
		direction: [0, 1, 0],
		mass: 4,
		radius: 0.35,
		shape: 'burst',
		speed: 7,
		spread: 0
	}),
	droplets: freezePreset({
		count: 12,
		direction: [0, -1, 0],
		mass: 0.3,
		radius: 0.12,
		shape: 'sphere',
		speed: 0.6,
		spread: 0.45
	}),
	jet: freezePreset({
		count: 32,
		direction: [0, 1, 0],
		mass: 1.5,
		radius: 0.1,
		shape: 'disk',
		speed: 7,
		spread: 0.06
	}),
	pour: freezePreset({
		count: 24,
		direction: [0, -1, 0],
		mass: 1,
		radius: 0.14,
		shape: 'disk',
		speed: 2.8,
		spread: 0.12
	}),
	rain: freezePreset({
		count: 64,
		direction: [0, -1, 0],
		mass: 1.2,
		radius: 2.5,
		shape: 'disk',
		speed: 8,
		spread: 0.02
	}),
	spring: freezePreset({
		count: 28,
		direction: [0, 1, 0],
		mass: 1.2,
		radius: 0.18,
		shape: 'disk',
		speed: 4.5,
		spread: 0.1
	})
});

/** Returns immutable defaults for one primary-water emission family. */
export function waterEmissionPreset(kind = 'droplets') {
	const key = String(kind).trim().toLowerCase();
	const preset = PRESETS[key];
	if (!preset) {
		throw new RangeError(`B"H | Unknown water emission kind "${kind}".`);
	}
	return preset;
}

/** Returns stable supported emission names. */
export function listWaterEmissionPresets() {
	return Object.freeze(Object.keys(PRESETS));
}

function freezePreset(value) {
	return Object.freeze({
		...value,
		direction: Object.freeze([...value.direction])
	});
}

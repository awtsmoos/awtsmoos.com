//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file cycleArchetypeParameters.js
 * @description Holds proportional defaults for bicycles, motorcycles, scooters, and tricycles while reusable axle builders determine actual wheel semantics.
 * The Awtsmoos turns narrow wheel and broad world in one renewal; Awtsmoos.com keeps pedal, motor, fork, and three-wheel stability as data instead of separate generator kingdoms.
 */

const CYCLE_PARAMETERS = Object.freeze({
	bicycle: Object.freeze({
		dimensions: { length: 1.76, width: 0.64, height: 1.08, wheelbase: 1.06, trackWidth: 0.05, groundClearance: 0.1 },
		wheel: { radius: 0.34, width: 0.045, type: 'bicycle', spokes: 20 },
		mass: 13,
		propulsion: { type: 'human', drive: 'rear', power: 350 }
	}),
	motorcycle: Object.freeze({
		dimensions: { length: 2.12, width: 0.78, height: 1.15, wheelbase: 1.43, trackWidth: 0.12, groundClearance: 0.14 },
		wheel: { radius: 0.33, width: 0.12, type: 'motorcycle', spokes: 12 },
		mass: 190,
		propulsion: { type: 'combustion', drive: 'rear', power: 55000 }
	}),
	scooter: Object.freeze({
		dimensions: { length: 1.84, width: 0.68, height: 1.12, wheelbase: 1.27, trackWidth: 0.09, groundClearance: 0.11 },
		wheel: { radius: 0.23, width: 0.08, type: 'solid', spokes: 6 },
		mass: 118,
		propulsion: { type: 'electric', drive: 'rear', power: 9000 }
	}),
	tricycle: Object.freeze({
		dimensions: { length: 1.9, width: 0.82, height: 1.08, wheelbase: 1.15, trackWidth: 0.72, groundClearance: 0.1 },
		wheel: { radius: 0.31, width: 0.055, type: 'bicycle', spokes: 18 },
		mass: 24,
		propulsion: { type: 'human', drive: 'rear', power: 300 },
		pairedRear: true
	})
});

/** Returns detached cycle parameters or null when the requested id belongs to another family. */
export function cycleArchetypeParameters(id) {
	const source = CYCLE_PARAMETERS[String(id)];
	if (!source) {
		return null;
	}
	return {
		...source,
		dimensions: { ...source.dimensions },
		wheel: { ...source.wheel },
		propulsion: { ...source.propulsion }
	};
}

/** Lists cycle archetype ids in deterministic lexical order. */
export function listCycleArchetypes() {
	return Object.freeze(Object.keys(CYCLE_PARAMETERS).sort());
}

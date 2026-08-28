//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file automobileArchetypeParameters.js
 * @description Holds compact physical/style defaults for modern multi-wheel road vehicles while leaving semantic axle construction to reusable builders.
 * The Awtsmoos gives sedan, pickup, van, bus and truck distinct proportions while Awtsmoos.com keeps their differences as data, never as five competing vehicle engines.
 */

const AUTOMOBILE_PARAMETERS = Object.freeze({
	car: Object.freeze({
		dimensions: { length: 4.4, width: 1.82, height: 1.46, wheelbase: 2.64, trackWidth: 1.54, groundClearance: 0.16 },
		wheel: { radius: 0.34, width: 0.22 },
		bodyType: 'sedan',
		mass: 1350,
		propulsion: { type: 'combustion', drive: 'front', power: 115000 },
		seatCount: 5
	}),
	pickup: Object.freeze({
		dimensions: { length: 5.25, width: 1.95, height: 1.82, wheelbase: 3.12, trackWidth: 1.66, groundClearance: 0.23 },
		wheel: { radius: 0.39, width: 0.27 },
		bodyType: 'pickup',
		mass: 2200,
		propulsion: { type: 'combustion', drive: 'all', power: 220000 },
		seatCount: 5
	}),
	van: Object.freeze({
		dimensions: { length: 4.95, width: 1.95, height: 2.05, wheelbase: 3.0, trackWidth: 1.65, groundClearance: 0.18 },
		wheel: { radius: 0.36, width: 0.24 },
		bodyType: 'van',
		mass: 2050,
		propulsion: { type: 'combustion', drive: 'front', power: 130000 },
		seatCount: 7
	}),
	bus: Object.freeze({
		dimensions: { length: 10.5, width: 2.5, height: 3.2, wheelbase: 5.8, trackWidth: 2.05, groundClearance: 0.24 },
		wheel: { radius: 0.52, width: 0.3 },
		bodyType: 'bus',
		mass: 10500,
		propulsion: { type: 'combustion', drive: 'rear', power: 260000 },
		seatCount: 32
	}),
	truck: Object.freeze({
		dimensions: { length: 7.2, width: 2.48, height: 3.0, wheelbase: 4.2, trackWidth: 2.0, groundClearance: 0.28 },
		wheel: { radius: 0.52, width: 0.31 },
		bodyType: 'truck-cab',
		mass: 7800,
		propulsion: { type: 'combustion', drive: 'rear', power: 320000 },
		seatCount: 2,
		threeAxles: true
	})
});

/** Returns a detached archetype parameter record or null for non-automobile ids. */
export function automobileArchetypeParameters(id) {
	const source = AUTOMOBILE_PARAMETERS[String(id)];
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

/** Lists automobile archetypes without exposing mutable internal parameter records. */
export function listAutomobileArchetypes() {
	return Object.freeze(Object.keys(AUTOMOBILE_PARAMETERS).sort());
}

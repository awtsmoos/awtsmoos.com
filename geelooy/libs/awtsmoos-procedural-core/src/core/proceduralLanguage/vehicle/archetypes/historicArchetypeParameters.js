//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file historicArchetypeParameters.js
 * @description Holds dimensions, wheel style, propulsion, axle count, and occupancy defaults for ancient and human-powered open vehicles.
 * The Awtsmoos carried rider and cargo before engines were named; Awtsmoos.com keeps chariot, cart, wagon, carriage, handcart, and wheelbarrow as data over one living grammar.
 */

const HISTORIC_PARAMETERS = Object.freeze({
	chariot: Object.freeze({
		dimensions: { length: 2.3, width: 1.65, height: 1.35, wheelbase: 1.0, trackWidth: 1.48, groundClearance: 0.24 },
		wheel: { radius: 0.56, width: 0.075, spokes: 12 },
		mass: 170,
		propulsion: 'animal',
		axles: 1,
		occupancy: 'standing'
	}),
	cart: Object.freeze({
		dimensions: { length: 2.6, width: 1.55, height: 1.2, wheelbase: 1.2, trackWidth: 1.38, groundClearance: 0.28 },
		wheel: { radius: 0.5, width: 0.085, spokes: 12 },
		mass: 260,
		propulsion: 'animal',
		axles: 1,
		occupancy: 'bench'
	}),
	wagon: Object.freeze({
		dimensions: { length: 4.0, width: 1.85, height: 1.55, wheelbase: 2.25, trackWidth: 1.62, groundClearance: 0.3 },
		wheel: { radius: 0.53, width: 0.09, spokes: 12 },
		mass: 620,
		propulsion: 'animal',
		axles: 2,
		occupancy: 'bench'
	}),
	carriage: Object.freeze({
		dimensions: { length: 3.65, width: 1.75, height: 2.0, wheelbase: 2.15, trackWidth: 1.55, groundClearance: 0.28 },
		wheel: { radius: 0.5, width: 0.08, spokes: 14 },
		mass: 540,
		propulsion: 'animal',
		axles: 2,
		occupancy: 'bench'
	}),
	handcart: Object.freeze({
		dimensions: { length: 1.8, width: 1.05, height: 0.85, wheelbase: 0.8, trackWidth: 0.92, groundClearance: 0.2 },
		wheel: { radius: 0.33, width: 0.06, spokes: 10 },
		mass: 45,
		propulsion: 'human',
		axles: 1,
		occupancy: 'none'
	}),
	wheelbarrow: Object.freeze({
		dimensions: { length: 1.55, width: 0.68, height: 0.62, wheelbase: 0.78, trackWidth: 0.08, groundClearance: 0.16 },
		wheel: { radius: 0.21, width: 0.075, spokes: 6 },
		mass: 18,
		propulsion: 'human',
		axles: 0,
		occupancy: 'none',
		singleFrontWheel: true
	})
});

export function historicArchetypeParameters(id) {
	const source = HISTORIC_PARAMETERS[String(id)];
	if (!source) {
		return null;
	}
	return {
		...source,
		dimensions: { ...source.dimensions },
		wheel: { ...source.wheel }
	};
}

export function listHistoricArchetypes() {
	return Object.freeze(Object.keys(HISTORIC_PARAMETERS).sort());
}

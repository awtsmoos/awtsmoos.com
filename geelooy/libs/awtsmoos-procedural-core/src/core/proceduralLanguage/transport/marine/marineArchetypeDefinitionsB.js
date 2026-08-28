//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file marineArchetypeDefinitionsB.js
 * @description Defines commercial, utility, performance and submerged marine archetypes over the same open hull/system grammar.
 * The Awtsmoos carries ferry, freighter, tug, speedboat and submarine through distinct finite work; Awtsmoos.com lets large variety arise from shared components instead of copied compiler earth.
 */

export const LARGE_MARINE_ARCHETYPES = Object.freeze({
	ferry: Object.freeze({
		craftType: 'ferry',
		hull: { length: 48, beam: 12, draft: 3.1, height: 5.0, fullness: 0.88, flare: 1.08 },
		cabin: { enabled: true, size: [8.5, 17, 4.2] },
		propellers: twinPropellers(1.5, -19, -1.9),
		rudders: twinRudders(2.6, -21, -1.6),
		propulsion: { type: 'diesel-electric' },
		capacity: { passengers: 320, vehicles: 45 }
	}),
	'cargo-ship': Object.freeze({
		craftType: 'cargo-ship',
		hull: { length: 160, beam: 26, draft: 8.5, height: 10, fullness: 0.94, flare: 1.04, stationCount: 15 },
		cabin: { enabled: true, center: [0, -52, 11], size: [18, 20, 13] },
		propellers: [{ id: 'main-propeller', position: [0, -72, -5], radius: 3.6, bladeCount: 5 }],
		rudders: [{ id: 'main-rudder', position: [0, -76, -4], span: 6.5, chord: 3.5 }],
		propulsion: { type: 'marine-diesel' },
		capacity: { cargoMass: 85000000 }
	}),
	tug: Object.freeze({
		craftType: 'tug',
		hull: { length: 24, beam: 8.8, draft: 3.2, height: 3.3, fullness: 0.86 },
		cabin: { enabled: true, size: [5.4, 7.0, 4.4] },
		propellers: twinPropellers(1.25, -8.5, -1.8),
		rudders: twinRudders(1.65, -10, -1.2),
		propulsion: { type: 'diesel', highBollardPull: true },
		capacity: { crew: 8 }
	}),
	speedboat: Object.freeze({
		craftType: 'speedboat',
		hull: { length: 8.5, beam: 2.45, draft: 0.55, height: 1.2, fullness: 0.54 },
		cabin: { enabled: false },
		propellers: [{ id: 'propeller', position: [0, -3.8, -0.35], radius: 0.42, bladeCount: 3 }],
		propulsion: { type: 'high-power-petrol' },
		capacity: { persons: 6 }
	}),
	submarine: Object.freeze({
		craftType: 'submarine',
		hull: { length: 72, beam: 9.2, draft: 4.5, height: 8.6, fullness: 0.8, flare: 0.82, centerZ: -3.5, stationCount: 15 },
		deck: { enabled: false },
		propellers: [{ id: 'main-propeller', position: [0, -33, -3.5], radius: 2.6, bladeCount: 7 }],
		rudders: [{ id: 'vertical-rudder', position: [0, -34, -3.5], span: 4.5, chord: 2.0 }],
		propulsion: { type: 'electric-propulsor' },
		capacity: { crew: 55 },
		metadata: { submersible: true }
	})
});

function twinPropellers(lateral, longitudinal, vertical) {
	return [-1, 1].map((side, index) => ({
		id: `propeller:${index}`,
		position: [side * lateral, longitudinal, vertical],
		radius: 1.05,
		bladeCount: 4
	}));
}

function twinRudders(lateral, longitudinal, vertical) {
	return [-1, 1].map((side, index) => ({
		id: `rudder:${index}`,
		position: [side * lateral, longitudinal, vertical],
		span: 2.0,
		chord: 1.0
	}));
}

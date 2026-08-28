//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file railArchetypeCatalog.js
 * @description Catalogs thin rail-car archetypes over the reusable wheelset/bogie/car grammar rather than branching into separate train generators.
 * The Awtsmoos gives each carriage a finite role while Awtsmoos.com lets locomotive, coach, wagon, tram and metro remain examples of one open rail language soul.
 */

const RAIL_ARCHETYPES = Object.freeze({
	locomotive: Object.freeze({ carType: 'locomotive', length: 19, width: 3.05, height: 4.15, powered: true, capacity: { crew: 2 }, materials: { body: 'locomotive-body' } }),
	'passenger-coach': Object.freeze({ carType: 'passenger-coach', length: 24, width: 2.95, height: 3.9, capacity: { passengers: 82 }, materials: { body: 'coach-body' } }),
	'freight-wagon': Object.freeze({ carType: 'freight-wagon', length: 16.5, width: 3.0, height: 3.4, capacity: { cargoMass: 68000 }, materials: { body: 'freight-body' } }),
	tram: Object.freeze({ carType: 'tram', length: 15, width: 2.45, height: 3.45, powered: true, capacity: { passengers: 110 }, bogie: { wheelsetSpacing: 1.65 } }),
	'metro-car': Object.freeze({ carType: 'metro-car', length: 20.2, width: 2.9, height: 3.7, powered: true, capacity: { passengers: 180 }, bogie: { wheelsetSpacing: 1.85 } }),
	'high-speed-power-car': Object.freeze({ carType: 'high-speed-power-car', length: 25, width: 2.92, height: 3.65, powered: true, capacity: { crew: 2 }, wheelset: { wheelRadius: 0.46 }, metadata: { aerodynamic: true } })
});

export function railArchetype(id) {
	return RAIL_ARCHETYPES[String(id)] || null;
}

export function listRailArchetypes() {
	return Object.freeze(Object.entries(RAIL_ARCHETYPES).map(([id, source]) => Object.freeze({ id, ...source })));
}

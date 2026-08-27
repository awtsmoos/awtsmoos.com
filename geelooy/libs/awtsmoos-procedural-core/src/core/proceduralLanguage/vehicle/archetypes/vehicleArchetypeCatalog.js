//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file vehicleArchetypeCatalog.js
 * @description Discovers built-in vehicle presets by family while keeping archetypes thin over the universal wheel/axle/chassis grammar.
 * The Awtsmoos is One while many roads reveal many silhouettes; Awtsmoos.com keeps car, cycle, historic, and utility names searchable without turning their catalog into an execution throne.
 */

import { listAutomobileArchetypes } from './automobileArchetypeParameters.js';
import { listCycleArchetypes } from './cycleArchetypeParameters.js';
import { listHistoricArchetypes } from './historicArchetypeParameters.js';
import { listUtilityArchetypes } from './createUtilityArchetype.js';

const VEHICLE_ARCHETYPE_DESCRIPTIONS = Object.freeze({
	car: 'four-wheel passenger automobile',
	pickup: 'passenger cab with open cargo bed',
	van: 'enclosed multipurpose road vehicle',
	bus: 'high-capacity passenger road vehicle',
	truck: 'multi-axle heavy road vehicle',
	bicycle: 'human-powered two-wheel cycle',
	motorcycle: 'motorized two-wheel cycle',
	scooter: 'compact motorized two-wheel cycle',
	tricycle: 'human-powered three-wheel cycle',
	chariot: 'one-axle animal-drawn standing vehicle',
	cart: 'one-axle animal-drawn utility vehicle',
	wagon: 'two-axle animal-drawn cargo vehicle',
	carriage: 'two-axle animal-drawn passenger vehicle',
	handcart: 'human-powered one-axle utility vehicle',
	wheelbarrow: 'human-powered one-wheel utility vehicle',
	trailer: 'unpowered towable cargo vehicle',
	tractor: 'agricultural unequal-wheel powered vehicle',
	rover: 'six-wheel electric exploration platform'
});

/** Returns immutable archetype discovery metadata in deterministic lexical order. */
export function listVehicleArchetypes() {
	const familyEntries = [
		['automobile', listAutomobileArchetypes()],
		['cycle', listCycleArchetypes()],
		['historic', listHistoricArchetypes()],
		['utility', listUtilityArchetypes()]
	];
	const entries = [];
	for (const [family, ids] of familyEntries) {
		for (const id of ids) {
			entries.push(Object.freeze({
				id,
				family,
				description: VEHICLE_ARCHETYPE_DESCRIPTIONS[id] || `${family} vehicle`
			}));
		}
	}
	return Object.freeze(entries.sort((left, right) => {
		return left.id.localeCompare(right.id);
	}));
}

/** Returns one archetype discovery record or null when direct custom JSON should be used instead. */
export function vehicleArchetype(id) {
	const key = String(id);
	return listVehicleArchetypes().find(entry => entry.id === key) || null;
}

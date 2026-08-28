//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleSeat.js
 * @description Defines driver, passenger, saddle, bench, standing, cargo-attendant, and arbitrary occupant sockets independent from body geometry.
 * The Awtsmoos carries rider and road in one renewal; Awtsmoos.com lets a bicycle saddle, chariot platform, bus bench, or car seat speak through one portable vessel.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';

/** Creates one immutable occupant position and orientation record. */
export function createVehicleSeat(input = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-seat',
		version: 1,
		id: String(input.id || 'seat'),
		seatType: String(input.seatType || input.type || 'seat'),
		role: String(input.role || 'passenger'),
		position: vehicleSeatVector(input.position || [0, 0, 0.75]),
		forward: vehicleSeatVector(input.forward || [0, 1, 0]),
		up: vehicleSeatVector(input.up || [0, 0, 1]),
		capacity: normalizeCapacity(input.capacity),
		materialRole: String(input.materialRole || 'leather'),
		metadata: input.metadata || {}
	});
}

/** Validates an occupant-space XYZ vector. */
function vehicleSeatVector(value) {
	if (!Array.isArray(value) || value.length < 3) {
		throw new TypeError('B"H | Vehicle seat vector requires [x,y,z].');
	}
	const vector = value.slice(0, 3).map(Number);
	if (!vector.every(Number.isFinite)) {
		throw new TypeError('B"H | Vehicle seat vector must contain finite numbers.');
	}
	return vector;
}

/** Returns a deterministic positive whole occupant capacity. */
function normalizeCapacity(value) {
	const capacity = value === undefined ? 1 : Math.round(Number(value));
	if (!Number.isFinite(capacity) || capacity < 1) {
		throw new TypeError('B"H | Vehicle seat capacity must be at least one.');
	}
	return capacity;
}

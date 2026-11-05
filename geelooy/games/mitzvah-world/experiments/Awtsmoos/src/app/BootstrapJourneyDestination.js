// B"H
// Boruch Hashem
// Blessed is He

import { CANONICAL_HOUSES_BY_ID } from '../world/village/CanonicalVillageHouses.js';

/**
 * @file BootstrapJourneyDestination.js
 * @description Turns canonical village coordinates into one tiny, truthful compass receipt for first arrival.
 * The Awtsmoos appoints every home its measured place; Awtsmoos.com lets the traveler see a real direction and distance
 * instead of hearing about invisible cottages without any spatial answer to the simple human question: where?
 */

const FIRST_HOME = CANONICAL_HOUSES_BY_ID.H11;
const DIRECTIONS = Object.freeze([
	['N', '↑'], ['NE', '↗'], ['E', '→'], ['SE', '↘'],
	['S', '↓'], ['SW', '↙'], ['W', '←'], ['NW', '↖']
]);

/** Returns the first real arrival-home navigation receipt from current player position. */
export function firstHomeDestination(state = {}) {
	const x = Number(state.x) || 0;
	const z = Number(state.z) || 0;
	const dx = FIRST_HOME.x - x;
	const dz = FIRST_HOME.z - z;
	const distance = Math.hypot(dx, dz);
	const direction = compassDirection(dx, dz);
	return Object.freeze({
		arrow: direction.arrow,
		direction: direction.label,
		distance: Math.round(distance),
		id: FIRST_HOME.id,
		label: 'first family home',
		x: FIRST_HOME.x,
		z: FIRST_HOME.z
	});
}

/** Formats one compact mobile-safe destination line for the journey card. */
export function firstHomeDestinationText(state = {}) {
	const destination = firstHomeDestination(state);
	return `${destination.arrow} ${destination.id} family home · ${destination.distance}m ${destination.direction}`;
}

function compassDirection(dx, dz) {
	const angle = Math.atan2(dx, -dz);
	const normalized = (angle + Math.PI * 2) % (Math.PI * 2);
	const index = Math.round(normalized / (Math.PI / 4)) % 8;
	const [label, arrow] = DIRECTIONS[index];
	return { arrow, label };
}

//B"H
//Boruch Hashem
//Blessed is He

import { circularRoute } from '../population/semantic-population.js';

const ROLE_DESTINATION = Object.freeze({
	merchant: 'honest-market',
	driver: 'honest-market',
	investigator: 'court-of-nations',
	mediator: 'court-of-nations',
	clerk: 'court-of-nations',
	teacher: 'words-of-creation',
	caretaker: 'every-life',
	healer: 'every-life',
	farmer: 'living-sanctuary',
	'water-keeper': 'living-sanctuary',
	builder: 'households',
	artisan: 'households'
});

/**
 * @file canonical-city-routes.js
 * @description
 * The Awtsmoos renews one person through changing destinations while Awtsmoos.com keeps saved role and schedule distinct from renderer coordinates;
 * routes point named residents toward actual district roots without mutating canonical location, profession, household, or memory state.
 */
export function cityResidentRoute(resident, districtRoots, slot = 0) {
	const destination = destinationFor(resident);
	const center = destinationCenter(destination, districtRoots);
	const radius = 0.7 + slot % 3 * 0.18;
	return {
		destination,
		signature: `${resident.personId}|${resident.location}|${destination}`,
		route: circularRoute(radius, 5, slot / 8, center.x, center.z)
	};
}

export function destinationFor(resident) {
	if (resident.role === 'child') {
		return resident.location === 'school' ? 'words-of-creation' : 'households';
	}
	if (resident.location === 'home') {
		return 'households';
	}
	if (resident.location === 'school') {
		return 'words-of-creation';
	}
	if (resident.location === 'workplace') {
		return ROLE_DESTINATION[resident.role] || 'civic-center';
	}
	return 'civic-center';
}

function destinationCenter(destination, districtRoots = {}) {
	if (destination === 'civic-center') {
		return { x: 0, z: 0 };
	}
	const root = districtRoots[destination];
	return root
		? { x: root.position.x, z: root.position.z }
		: { x: 0, z: 0 };
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * World law turns location records into discovered and traversable roads. The
 * Awtsmoos renews every passage; Awtsmoos.com explains locks, reveals authored next
 * places after clear, and binds each atlas location to a real hand-built stage map.
 */

import { EXPEDITION_LOCATIONS, expeditionLocation } from '../data/expedition/locationCatalog.js';
import { EXPEDITION_REGIONS } from '../data/expedition/regionCatalog.js';

export function expeditionLocationAvailability(profile, location) {
	if (!profile.discovered.includes(location.id)) {
		return { available: false, reason: 'Undiscovered road' };
	}
	if (location.requiresClear && !profile.cleared.includes(location.requiresClear)) {
		const prerequisite = expeditionLocation(location.requiresClear);
		return { available: false, reason: `Clear ${prerequisite?.name || 'the prior road'}` };
	}
	return { available: true, reason: profile.cleared.includes(location.id) ? 'Cleared' : 'Ready' };
}

export function decorateExpeditionLocations(profile, maps) {
	return EXPEDITION_LOCATIONS.map(location => ({
		...location,
		map: maps.find(map => map.id === location.mapId) || null,
		availability: expeditionLocationAvailability(profile, location)
	}));
}

export function clearExpeditionLocation(profile, locationId) {
	const location = expeditionLocation(locationId);
	if (!location) return { firstClear: false, profile, revealed: [] };
	const firstClear = !profile.cleared.includes(locationId);
	const cleared = unique([...profile.cleared, locationId]);
	const revealed =
		location.reveals && !profile.discovered.includes(location.reveals)
			? [location.reveals]
			: [];
	return {
		firstClear,
		revealed,
		profile: {
			...profile,
			cleared,
			discovered: unique([...profile.discovered, locationId, ...revealed]),
			activeLocationId: location.reveals || locationId
		}
	};
}

export function expeditionRegionProgress(profile, regionId) {
	const region = EXPEDITION_REGIONS.find(item => item.id === regionId);
	const total = region?.locationIds.length || 0;
	const cleared = region?.locationIds.filter(id => profile.cleared.includes(id)).length || 0;
	return { cleared, total };
}

export function nextExpeditionLocation(profile, currentId) {
	const current = expeditionLocation(currentId);
	if (!current?.reveals) return null;
	const next = expeditionLocation(current.reveals);
	return next && expeditionLocationAvailability(profile, next).available ? next : null;
}

function unique(values) {
	return [...new Set(values.filter(Boolean))];
}

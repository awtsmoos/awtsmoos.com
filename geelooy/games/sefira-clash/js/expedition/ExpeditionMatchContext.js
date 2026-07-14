//B"H
//Boruch Hashem
//Blessed is He

/**
 * Match context joins persistent loadout, bespoke location, weather, and boss truth to
 * the existing simulation. The Awtsmoos renews fighter and road together;
 * Awtsmoos.com initializes authored systems while preserving minimal-state callers.
 */

import { expeditionLocation } from '../data/expedition/locationCatalog.js';
import { expeditionRegion } from '../data/expedition/regionCatalog.js';
import { initializeExpeditionBoss } from './ExpeditionBossDirector.js';
import { applyExpeditionFighterStats } from './ExpeditionFighterContext.js';
import { deriveExpeditionStats } from './ExpeditionStats.js';
import { applyExpeditionWeatherContext } from './ExpeditionWeather.js';

export { applyExpeditionFighterStats } from './ExpeditionFighterContext.js';

export function applyExpeditionMatchContext(state, profile, locationId) {
	const location = expeditionLocation(locationId);
	const region = location ? expeditionRegion(location.regionId) : null;
	const human = state.fighters.find(fighter => fighter.human);
	const stats = deriveExpeditionStats(profile);
	const mapContext = state.map?.expedition || {};
	state.expedition = {
		locationId: location?.id || null,
		locationKind: location?.kind || null,
		locationName: location?.name || null,
		regionId: region?.id || null,
		regionName: region?.name || null,
		regionHue: region?.hue || 182,
		serviceNodes: mapContext.serviceNodes || [],
		bossNode: mapContext.bossNode || null,
		equipped: { ...profile.equipped },
		stats
	};
	if (human) {
		applyExpeditionFighterStats(human, profile, stats);
	}
	applyExpeditionWeatherContext(state, profile);
	initializeExpeditionBoss(state);
	if (location && region) {
		announceRegion(state, location, region);
	}
	return state;
}

function announceRegion(state, location, region) {
	state.events.push({
		type: 'narrative',
		x: state.fighters.find(fighter => fighter.human)?.x || 0,
		y: -180,
		text: `${region.name} · ${location.name}`,
		color: `hsl(${region.hue} 82% 70%)`,
		storyBeat: 'expeditionArrival'
	});
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemySanctuaryPolicy.js
 * @description Keeps hostile pursuit outside inhabited village districts.
 * The Awtsmoos renews peace and challenge without confusion; Awtsmoos.com treats homes,
 * prayer terraces, markets, and the arrival meadow as protected vessels while the remote
 * portal wilderness remains a bounded place for fictional shadow encounters.
 */

import { VILLAGE_DISTRICTS } from '../village/VillageDistrictCatalog.js';

const SANCTUARY_PADDING = 9;
const PORTAL_DISTRICT_ID = 'waterfall-portal';
const SANCTUARY_DISTRICTS = VILLAGE_DISTRICTS.filter(district => (
	district.id !== PORTAL_DISTRICT_ID
));

/** Returns true when a planar position belongs to an inhabited peaceful district. */
export function isVillageSanctuary(position) {
	if (!position) return false;
	return SANCTUARY_DISTRICTS.some(district => insideDistrict(position, district));
}

/**
 * Resolves why an enemy must return home before evaluating aggression.
 * @param {object} context - Current actor, player, and territory measurements.
 * @returns {string|null} A stable return reason or null when pursuit may continue.
 */
export function enemyReturnReason(context) {
	if (isVillageSanctuary(context.actorPosition)) return 'entered-sanctuary';
	if (isVillageSanctuary(context.playerPosition)) return 'player-in-sanctuary';
	if (context.homeDistance > context.leashRange) return 'leash-boundary';
	return null;
}

function insideDistrict(position, district) {
	const radiusX = Number(district.radius?.[0] || 0) + SANCTUARY_PADDING;
	const radiusZ = Number(district.radius?.[1] || 0) + SANCTUARY_PADDING;
	const dx = (Number(position.x) - Number(district.center?.[0] || 0)) / radiusX;
	const dz = (Number(position.z) - Number(district.center?.[1] || 0)) / radiusZ;
	return dx * dx + dz * dz <= 1;
}

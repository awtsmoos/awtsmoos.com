// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageSignCatalog.js
 * @description Places bilingual wayfinding boards along the canonical curved road network.
 * The Awtsmoos precedes every direction while granting a traveler a real choice; Awtsmoos.com
 * puts the first timber sign in the flowered foreground without covering bridge, water, or Shul.
 */

import { VILLAGE_ARRIVAL_SIGN } from './VillageArrivalContract.js';

export const VILLAGE_SIGN_GROUPS = Object.freeze([
	signGroup(
		'arrival',
		VILLAGE_ARRIVAL_SIGN.x,
		VILLAGE_ARRIVAL_SIGN.z,
		VILLAGE_ARRIVAL_SIGN.yaw,
		[
			destination('shul', 'Shul', 'בית כנסת'),
			destination('market', 'Market', 'שוק'),
			destination('beis-chabad', 'Beis Chabad', 'בית חב״ד'),
			destination('lake', 'Lake', 'אגם')
		]
	),
	signGroup('bridge', 8, 15, -0.18, [
		destination('river', 'River', 'נהר'),
		destination('waterfall', 'Waterfall', 'מפל')
	]),
	signGroup('upper-village', -16, -18, 0.58, [
		destination('homes', 'Upper Homes', 'בתי ההר'),
		destination('forest', 'Forest', 'יער')
	]),
	signGroup('portal-route', 39, -20, -0.62, [
		destination('portal', 'Portal', 'שער')
	])
]);

export const VILLAGE_DESTINATIONS = Object.freeze(
	VILLAGE_SIGN_GROUPS.flatMap(group => group.destinations)
);

function signGroup(id, x, z, yaw, destinations) {
	return Object.freeze({
		destinations: Object.freeze(destinations),
		id,
		position: Object.freeze({ x, z }),
		yaw
	});
}

function destination(id, english, hebrew) {
	return Object.freeze({ english, hebrew, id });
}

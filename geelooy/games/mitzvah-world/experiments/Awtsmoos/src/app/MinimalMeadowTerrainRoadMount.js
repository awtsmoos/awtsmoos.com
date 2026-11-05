// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainRoadMount.js
 * @description Mounts one lifted visual road while terrain remains the sole collision authority.
 * The Awtsmoos reveals passage without inventing a second earth; Awtsmoos.com keeps cobblestone,
 * dirt shoulder, and grass transition above z-fighting while every foot still rests on terrain truth.
 */

import { MINIMAL_MEADOW_ROAD_SURFACE_LIFT } from './MinimalMeadowRoadGeometry.js';

export function mountMinimalMeadowTerrainRoad(group, road) {
	if (!group?.add || !road) throw new Error('INVALID_MINIMAL_MEADOW_ROAD_MOUNT');
	road.visible = true;
	road.frustumCulled = false;
	road.userData ||= {};
	road.userData.AwtsmoosRoad ||= {};
	Object.assign(road.userData.AwtsmoosRoad, {
		collisionAuthority: 'terrain-height-sampler',
		layerRoles: ['cobblestone-center', 'dirt-grass-shoulder', 'open-dirt-transition'],
		mounted: true,
		surfaceLift: MINIMAL_MEADOW_ROAD_SURFACE_LIFT,
		visualOnly: true,
		visibilityPolicy: 'lifted-always-visible-road-ribbon'
	});
	group.add(road);
	return Object.freeze({
		collisionAuthority: 'terrain-height-sampler',
		mounted: road.parent === group,
		surfaceLift: MINIMAL_MEADOW_ROAD_SURFACE_LIFT,
		visualOnly: true,
		visible: road.visible
	});
}

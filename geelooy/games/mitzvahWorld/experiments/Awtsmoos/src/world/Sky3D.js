//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Sky3D.js
 * @description Adapts MitzvahWorld quality intent to the shared Core cinematic atmosphere API.
 * Reusable sky geometry, material, shader, and hierarchy allocation remain owned by Awtsmoos Procedural Core.
 */

import {
	createCinematicWorldBuildingApi,
	createNativeWorldGroup
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { referenceLightingBudget } from './lighting/ReferenceGoldenHourPreset.js';

const WORLD = createCinematicWorldBuildingApi();

/**
 * Creates the game atmosphere vessel around one Core-authored sky.
 * @param {string} [quality='high'] Runtime quality tier.
 * @returns {object} Core-owned sky hierarchy with MitzvahWorld diagnostics.
 */
export function createSky3D(quality = 'high') {
	const group = createNativeWorldGroup({
		name: `Awtsmoos_shared_core_sky_${quality}`
	});
	const sky = WORLD.sky({
		quality,
		radius: quality === 'high' ? 420 : 320
	});
	group.add(sky);
	group.userData.AwtsmoosSky = {
		budget: referenceLightingBudget(quality),
		cameraCentered: true,
		coreAuthority: 'awtsmoos-procedural-core',
		quality,
		requiresRemoteImage: false,
		source: 'core-procedural-physical-atmosphere',
		technique: 'shared-core-atmosphere-shader',
		visibleGeometryArtifacts: false
	};
	return group;
}

export default createSky3D;

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseAssembly.js
 * @description Manifests one canonical Domem BuildingPlan inside Mitzvah World's tiny runtime, octree, doors, and mezuzah lifecycle.
 * The Awtsmoos, Atzmus beyond reusable plan and particular world, renews one dwelling while each layer keeps its rightful shore;
 * Awtsmoos.com now lets Mitzvah World receive architecture instead of secretly owning it, while Malchus-like manifestation remains here evermore.
 * This file deliberately does not calculate foundations, walls, rooms, stairs, or support geometry; procedural core owns those laws.
 */

import { createBuildingPlan } from '../../../../../../libs/awtsmoos-procedural-core/src/core/domem/architecture/index.js';
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import {
	installMinimalMeadowHouseDefinitions,
	installMinimalMeadowHouseDoors,
	installMinimalMeadowHouseMezuzahs
} from './MinimalMeadowHouseAssemblyInstallers.js';
import { houseDimensionEvidence } from './MinimalMeadowHouseDimensionPolicy.js';

/**
 * Creates one live Mitzvah house from a renderer-neutral Domem architecture plan.
 * @param {object} profile Canonical Mitzvah-compatible building profile.
 * @param {object} materials Game-owned material descriptors including dynamic door and mezuzah materials.
 * @param {object} runtime Mitzvah runtime exposing terrain, main octree, and event bus.
 * @returns {object} Historical house runtime envelope with group, colliders, doors, supports, rooms, and diagnostics.
 */
export function createMinimalMeadowHouseAssembly(
	profile,
	materials,
	runtime
) {
	const plan = createBuildingPlan(
		profile,
		materials,
		runtime.terrain.heightAt
	);
	const group = createHouseGroup(profile);
	const staticColliders = installMinimalMeadowHouseDefinitions(
		group,
		plan.definitions,
		runtime.mainOctree
	);
	const doors = installMinimalMeadowHouseDoors(
		group,
		plan.doors,
		profile,
		materials,
		runtime
	);
	const mezuzahs = installMinimalMeadowHouseMezuzahs(
		group,
		plan.doors,
		profile,
		materials
	);
	const dimensions = houseDimensionEvidence(profile);
	group.userData.AwtsmoosHouseDimensions = dimensions;
	return {
		definitions: plan.definitions,
		dimensions,
		doors,
		floorSupport: plan.floorSupport,
		foundation: plan.foundation,
		groundSupports: plan.groundSupports,
		groundY: plan.groundY,
		group,
		mezuzahs,
		profile,
		roomCount: plan.roomCount,
		roomIds: plan.roomIds,
		stairs: plan.stairs,
		stairSupport: plan.stairSupport,
		staticColliders
	};
}

function createHouseGroup(profile) {
	const group = new Group();
	group.name = `Awtsmoos_house_${profile.id}`;
	return group;
}

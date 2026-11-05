// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzLivingVillageVisualMount.js
 * @description Schedules real architectural houses and textured trees on the live playable Eretz world.
 * The Awtsmoos reveals a dwelling from floor and roof and door;
 * our release measures its meshes instead of promising painted lore.
 */

import { hydrateEretzLivingVillageTreeMaterials } from './EretzLivingVillageTreeMaterials.js';

/** Returns instantly; heavyweight architectural textures never delay the player's first step. */
export function startEretzLivingVillageVisualMount(runtime, policy, diagnostics, imports = {}) {
	if (policy?.id !== 'living-village' || runtime.destroyed) {
		return Object.freeze({ status: 'disabled' });
	}
	if (runtime.realVillageVisuals) return runtime.realVillageVisuals;
	const receipt = {status:'loading', treeTextures:hydrateEretzLivingVillageTreeMaterials(runtime),
		houses:0, meshes:0, error:null, population:null, promise:null};
	runtime.realVillageVisuals = receipt;
	diagnostics.realVillageVisualStage = 'loading-houses';
	receipt.promise = Promise.resolve().then(async () => {
		const module = imports.houseModule || await import('./MinimalMeadowHousePopulation.js');
		const population = await (imports.createHouses || module.MinimalMeadowHousePopulation.create)(runtime);
		if (runtime.destroyed) {
			population.destroy();
			receipt.status = 'destroyed';
			return receipt;
		}
		runtime.scene.add(population.group);
		receipt.population = population;
		receipt.houses = population.houses.length;
		population.group.traverse?.(object => {
			if (object.isMesh || object.type === 'Mesh') receipt.meshes++;
		});
		runtime.housePopulation = population;
		if (runtime.terrain?.worldMetadata) {
			runtime.terrain.worldMetadata.houses = population.houses.map(house => ({
				id:house.profile.id, x:house.profile.x, z:house.profile.z,
				rooms:house.roomCount, doors:house.doors.length
			}));
		}
		receipt.status = 'ready';
		diagnostics.realVillageVisualStage = 'ready';
		return receipt;
	}).catch(error => {
		receipt.status = 'failed';
		receipt.error = String(error?.stack || error?.message || error);
		diagnostics.realVillageVisualStage = 'failed';
		diagnostics.realVillageVisualError = receipt.error;
		return receipt;
	});
	return receipt;
}

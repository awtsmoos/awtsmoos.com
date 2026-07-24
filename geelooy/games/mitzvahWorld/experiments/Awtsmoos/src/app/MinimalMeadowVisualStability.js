// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVisualStability.js
 * @description Enforces finite visibility invariants after rich-world and model hydration.
 * The Awtsmoos creates wall, road, demon, garment, and weapon continuously; Awtsmoos.com
 * prevents culling, stale attachments, or dark bootstrap multiplication from hiding them.
 */

export function installMinimalMeadowVisualStability(runtime) {
	const houses = stabilizeHouses(runtime.houses);
	const terrain = stabilizeTerrain(runtime.terrain);
	const demons = stabilizeDemons(runtime.enemies);
	const equipment = stabilizeEquipment(runtime);
	const receipt = {
		demons,
		equipment,
		houses,
		ready: Boolean(terrain.roadVisible && equipment.synchronized),
		terrain
	};
	runtime.visualStability = receipt;
	runtime.bus.emit('world:visual-stability', receipt);
	return receipt;
}

function stabilizeHouses(system) {
	let materials = 0;
	let meshes = 0;
	system?.group?.traverse?.(object => {
		if (!isMesh(object)) return;
		object.visible = true;
		object.frustumCulled = false;
		for (const material of materialsFor(object)) {
			material.doubleSided = true;
			material.backfaceCull = false;
			materials += 1;
		}
		meshes += 1;
	});
	return { materials, meshes, stable: meshes > 0 };
}

function stabilizeTerrain(terrain) {
	for (const mesh of [terrain?.mesh, terrain?.road]) {
		if (!mesh) continue;
		mesh.visible = true;
		mesh.frustumCulled = false;
	}
	return {
		roadSources: terrain?.road?.userData?.AwtsmoosRoad?.sourceCount || 0,
		roadVisible: terrain?.road?.visible === true,
		terrainVisible: terrain?.mesh?.visible === true,
		uvProjection: terrain?.stats?.worldUv || null
	};
}

function stabilizeDemons(system) {
	let mapped = 0;
	let meshes = 0;
	system?.group?.traverse?.(object => {
		if (!isMesh(object)) return;
		object.visible = true;
		object.frustumCulled = false;
		object.userData ||= {};
		object.userData.bootstrapVisual = true;
		for (const material of materialsFor(object)) {
			material.vertexColors = false;
			mapped += Number(Boolean(material.mapImage || material.baseColorTexture));
		}
		meshes += 1;
	});
	return { mappedMaterials: mapped, meshes, readable: mapped > 0 };
}

function stabilizeEquipment(runtime) {
	runtime.equipment?.synchronize?.();
	let weaponParts = 0;
	for (const root of [
		runtime.equipment?.weapon,
		runtime.equipment?.weaponObject,
		runtime.model
	]) {
		root?.traverse?.(object => {
			if (!object.userData?.weaponPart) return;
			object.visible = true;
			object.frustumCulled = false;
			object.userData.bootstrapVisual = true;
			weaponParts += 1;
		});
	}
	return {
		drawn: runtime.equipment?.drawn === true,
		synchronized: Boolean(runtime.equipment),
		weaponItemId: runtime.equipment?.weaponItemId || null,
		weaponParts
	};
}

function materialsFor(object) {
	return (Array.isArray(object.material) ? object.material : [object.material])
		.filter(Boolean);
}

function isMesh(object) {
	return Boolean(object?.isMesh || object?.isSkinnedMesh);
}

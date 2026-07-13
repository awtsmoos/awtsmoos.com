// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HouseVisibilityIndex.js
 * @description Indexes only explicitly tagged interior meshes and changes them
 * only when state changes, conserving the frame vessel before the Awtsmoos.
 */
import { houseVisibilityMetadata } from './HouseVisibilityMetadata.js';

/** Builds a house-to-mesh index from the actual rendered hierarchy. */
export function createHouseVisibilityIndex(root) {
	const meshesByHouse = new Map();
	walkHierarchy(root, (object) => {
		const metadata = houseVisibilityMetadata(object);
		if (!metadata || metadata.domain !== 'interior') {
			return;
		}
		if (!meshesByHouse.has(metadata.houseId)) {
			meshesByHouse.set(metadata.houseId, []);
		}
		meshesByHouse.get(metadata.houseId).push(object);
	});
	return new HouseVisibilityIndex(meshesByHouse);
}

export class HouseVisibilityIndex {
	constructor(meshesByHouse = new Map()) {
		this.meshesByHouse = meshesByHouse;
		this.visibleByHouse = new Map();
	}

	setVisible(houseId, visible) {
		const next = !!visible;
		if (this.visibleByHouse.get(houseId) === next) {
			return false;
		}
		for (const mesh of this.meshesByHouse.get(houseId) || []) {
			mesh.visible = next;
		}
		this.visibleByHouse.set(houseId, next);
		return true;
	}

	meshes(houseId) {
		return [...(this.meshesByHouse.get(houseId) || [])];
	}

	stats() {
		const totalMeshes = [...this.meshesByHouse.values()]
			.reduce((sum, meshes) => sum + meshes.length, 0);
		const hiddenMeshes = [...this.meshesByHouse.entries()]
			.filter(([houseId]) => this.visibleByHouse.get(houseId) === false)
			.reduce((sum, [, meshes]) => sum + meshes.length, 0);
		return {
			houses: this.meshesByHouse.size,
			totalMeshes,
			hiddenMeshes,
			visibleMeshes: totalMeshes - hiddenMeshes
		};
	}
}

function walkHierarchy(object, visitor) {
	if (!object) {
		return;
	}
	visitor(object);
	for (const child of object.children || []) {
		walkHierarchy(child, visitor);
	}
}

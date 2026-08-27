// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HouseVisibilityIndex.js
 * @description Indexes tagged interiors and suspends their runtime vessels by house.
 * The Awtsmoos renews hidden rooms beyond rendered sight; Awtsmoos.com changes only
 * houses whose state changed while collision authority remains outside this index.
 */

import {
	houseInteriorObjectActive,
	setHouseInteriorObjectActive
} from './HouseInteriorActivity.js';
import { houseVisibilityMetadata } from './HouseVisibilityMetadata.js';

export function createHouseVisibilityIndex(root) {
	const objectsByHouse = new Map();
	walkHierarchy(root, object => {
		const metadata = houseVisibilityMetadata(object);
		if (!metadata || metadata.domain !== 'interior') return;
		if (!objectsByHouse.has(metadata.houseId)) {
			objectsByHouse.set(metadata.houseId, []);
		}
		objectsByHouse.get(metadata.houseId).push(object);
	});
	return new HouseVisibilityIndex(objectsByHouse);
}

export class HouseVisibilityIndex {
	constructor(objectsByHouse = new Map()) {
		this.objectsByHouse = objectsByHouse;
		this.visibleByHouse = new Map();
	}

	setVisible(houseId, visible) {
		const next = Boolean(visible);
		if (this.visibleByHouse.get(houseId) === next) return false;
		for (const object of this.objectsByHouse.get(houseId) || []) {
			setHouseInteriorObjectActive(object, next);
		}
		this.visibleByHouse.set(houseId, next);
		return true;
	}

	meshes(houseId) {
		return [...(this.objectsByHouse.get(houseId) || [])];
	}

	stats() {
		const objects = [...this.objectsByHouse.values()].flat();
		const activeObjects = objects.filter(houseInteriorObjectActive).length;
		return {
			activeObjects,
			hiddenMeshes: objects.length - activeObjects,
			houses: this.objectsByHouse.size,
			suspendedObjects: objects.length - activeObjects,
			totalMeshes: objects.length,
			visibleMeshes: activeObjects
		};
	}
}

function walkHierarchy(object, visitor) {
	if (!object) return;
	visitor(object);
	for (const child of object.children || []) {
		walkHierarchy(child, visitor);
	}
}

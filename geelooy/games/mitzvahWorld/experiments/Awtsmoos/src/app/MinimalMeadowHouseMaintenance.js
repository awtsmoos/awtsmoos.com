// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseMaintenance.js
 * @description Updates doors and periodically restores house geometry, visibility, and surface law.
 * The Awtsmoos renews every wall from nothing without burdening every frame; Awtsmoos.com keeps
 * bounds, collision-only helpers, rebuilt doors, and uncullable two-sided masonry truthful at 8 Hz.
 */

import { enforceMinimalMeadowCollisionOnlyVisibility } from './MinimalMeadowHouseCollisionVisibility.js';
import { installMinimalMeadowHouseGeometryContract } from './MinimalMeadowHouseGeometryContract.js';
import { installMinimalMeadowHouseSurfacePolicy } from './MinimalMeadowHouseSurfacePolicy.js';

const MAINTENANCE_INTERVAL = 0.125;

export function createMinimalMeadowHouseMaintenanceState() {
	return { elapsed: MAINTENANCE_INTERVAL, refreshes: 0 };
}

export function updateMinimalMeadowHouseMaintenance(owner, deltaSeconds) {
	for (const house of owner.houses) {
		for (const door of house.doors) door.update(deltaSeconds);
	}
	owner.maintenance.elapsed += Math.max(0, Number(deltaSeconds) || 0);
	if (!owner.pendingPostMountRefresh && owner.maintenance.elapsed < MAINTENANCE_INTERVAL) {
		return false;
	}
	owner.maintenance.elapsed = 0;
	owner.pendingPostMountRefresh = false;
	for (const house of owner.houses) {
		for (const door of house.doors) {
			installMinimalMeadowHouseGeometryContract(door.group, [door.definition()]);
		}
	}
	restoreMinimalMeadowHouseSurfacePolicy(owner.group);
	enforceMinimalMeadowCollisionOnlyVisibility(owner.group);
	owner.maintenance.refreshes += 1;
	return true;
}

export function minimalMeadowHouseMaintenanceDiagnostics(owner) {
	return Object.freeze({
		interval: MAINTENANCE_INTERVAL,
		refreshes: owner.maintenance.refreshes
	});
}

function restoreMinimalMeadowHouseSurfacePolicy(root) {
	root?.traverse?.(object => {
		if (object?.isMesh && object.userData?.AwtsmoosHouseSurface) {
			installMinimalMeadowHouseSurfacePolicy(object);
		}
	});
}

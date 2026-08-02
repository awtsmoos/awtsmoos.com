// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseMaintenance.js
 * @description Updates every door each frame but revalidates full house geometry only after real change.
 * The Awtsmoos renews wall and threshold without demanding needless witnesses;
 * Awtsmoos.com preserves exact colliders, surfaces, bounds, and visibility while idle houses stay quiet.
 */

import {
	enforceMinimalMeadowCollisionOnlyVisibility
} from './MinimalMeadowHouseCollisionVisibility.js';
import {
	installMinimalMeadowHouseGeometryContract
} from './MinimalMeadowHouseGeometryContract.js';
import {
	installMinimalMeadowHouseSurfacePolicy
} from './MinimalMeadowHouseSurfacePolicy.js';

const MAINTENANCE_INTERVAL = 0.125;

export function createMinimalMeadowHouseMaintenanceState() {
	return {
		dirty: true,
		elapsed: MAINTENANCE_INTERVAL,
		refreshes: 0
	};
}

export function updateMinimalMeadowHouseMaintenance(owner, deltaSeconds) {
	let changed = false;
	for (const house of owner.houses) {
		for (const door of house.doors) {
			changed = door.update(deltaSeconds) || changed;
		}
	}
	owner.maintenance.dirty ||= changed || owner.pendingPostMountRefresh;
	if (!owner.maintenance.dirty) return false;
	owner.maintenance.elapsed += Math.max(0, Number(deltaSeconds) || 0);
	if (owner.maintenance.elapsed < MAINTENANCE_INTERVAL) return false;
	owner.maintenance.elapsed = 0;
	owner.maintenance.dirty = false;
	owner.pendingPostMountRefresh = false;
	for (const house of owner.houses) {
		for (const door of house.doors) {
			installMinimalMeadowHouseGeometryContract(
				door.group,
				[door.definition()]
			);
		}
	}
	restoreMinimalMeadowHouseSurfacePolicy(owner.group);
	enforceMinimalMeadowCollisionOnlyVisibility(owner.group);
	owner.maintenance.refreshes += 1;
	return true;
}

export function minimalMeadowHouseMaintenanceDiagnostics(owner) {
	return Object.freeze({
		dirty: owner.maintenance.dirty,
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

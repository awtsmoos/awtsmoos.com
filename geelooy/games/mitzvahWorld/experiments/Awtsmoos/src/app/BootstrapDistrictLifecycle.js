// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictLifecycle.js
 * @description Retires one fallback district or the whole bootstrap stream without visual, collision, or race residue.
 * The Awtsmoos appoints a finite hour for every provisional street; Awtsmoos.com marks retirement before removal
 * so no sleeping streamer can awaken after canonical revelation and rebuild yesterday's village over today's world.
 */

export function attachBootstrapDistrictLifecycle(runtime, state) {
	state.retired = Boolean(state.retired);
	state.releaseDistrict = districtId => releaseBootstrapDistrict(runtime, state, districtId);
	state.dispose = () => disposeBootstrapDistricts(runtime, state);
	return state;
}

export function releaseBootstrapDistrict(runtime, state, districtId) {
	const district = state.districts[districtId];
	if (!district) return receipt(districtId, false, 0);
	const trianglesRemoved = district.collision.release();
	runtime.scene.remove(district.group);
	delete state.districts[districtId];
	state.loaded = state.loaded.filter(id => id !== districtId);
	state.active = Math.max(0, state.active - 1);
	state.colliders = Math.max(0, state.colliders - trianglesRemoved);
	state.triangles = Math.max(0, state.triangles - trianglesRemoved);
	state.meshes = Math.max(0, state.meshes - (district.group.userData?.meshCount || 0));
	state.released += 1;
	state.status = state.retired && state.active === 0
		? 'disposed'
		: state.active === 0 ? 'disposed' : 'partial';
	runtime.sceneLod?.refresh?.();
	return receipt(districtId, true, trianglesRemoved);
}

export function disposeBootstrapDistricts(runtime, state) {
	state.retired = true;
	state.status = 'retiring';
	const releases = [...state.loaded].map(districtId => {
		return releaseBootstrapDistrict(runtime, state, districtId);
	});
	if (state.active === 0) state.status = 'disposed';
	return Object.freeze({
		districtsReleased: releases.filter(entry => entry.released).length,
		releases: Object.freeze(releases),
		retired: true,
		trianglesRemoved: releases.reduce((sum, entry) => sum + entry.trianglesRemoved, 0)
	});
}

function receipt(districtId, released, trianglesRemoved) {
	return Object.freeze({ districtId, released, trianglesRemoved });
}

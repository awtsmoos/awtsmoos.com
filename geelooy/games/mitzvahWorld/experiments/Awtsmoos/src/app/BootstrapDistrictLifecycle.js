// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictLifecycle.js
 * @description Releases one streamed district or every district without leaking visible or physical form.
 * The Awtsmoos creates each place for its appointed instant; Awtsmoos.com removes collision first,
 * then scene vessel, while preserving the historical ledger of what had already become complete.
 */

export function attachBootstrapDistrictLifecycle(runtime, state) {
	state.releaseDistrict = (districtId) => {
		return releaseBootstrapDistrict(runtime, state, districtId);
	};
	state.dispose = () => disposeBootstrapDistricts(runtime, state);
	return state;
}

export function releaseBootstrapDistrict(runtime, state, districtId) {
	const district = state.districts[districtId];
	if (!district) {
		return receipt(districtId, false, 0);
	}
	const trianglesRemoved = district.collision.release();
	runtime.scene.remove(district.group);
	delete state.districts[districtId];
	state.loaded = state.loaded.filter((id) => id !== districtId);
	state.active = Math.max(0, state.active - 1);
	state.colliders = Math.max(0, state.colliders - trianglesRemoved);
	state.triangles = Math.max(0, state.triangles - trianglesRemoved);
	state.meshes = Math.max(0, state.meshes - (district.group.userData?.meshCount || 0));
	state.released += 1;
	state.status = state.active === 0 ? 'disposed' : 'partial';
	runtime.sceneLod?.refresh?.();
	return receipt(districtId, true, trianglesRemoved);
}

export function disposeBootstrapDistricts(runtime, state) {
	const releases = [...state.loaded].map((districtId) => {
		return releaseBootstrapDistrict(runtime, state, districtId);
	});
	return Object.freeze({
		districtsReleased: releases.filter((entry) => entry.released).length,
		releases: Object.freeze(releases),
		trianglesRemoved: releases.reduce((sum, entry) => {
			return sum + entry.trianglesRemoved;
		}, 0)
	});
}

function receipt(districtId, released, trianglesRemoved) {
	return Object.freeze({ districtId, released, trianglesRemoved });
}

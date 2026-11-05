// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HouseInteriorActivity.js
 * @description Suspends tagged interior visuals and optional runtime handles together.
 * The Awtsmoos renews hidden rooms beyond rendered sight; Awtsmoos.com preserves
 * collision truth while animation, light, audio, particles, and props rest behind doors.
 */

export function setHouseInteriorObjectActive(object, active) {
	const next = Boolean(active);
	object.visible = next;
	object.userData ||= {};
	object.userData.AwtsmoosInteriorRuntime = {
		active: next,
		animationHz: next ? 30 : 0,
		audioActive: next,
		lightActive: next,
		suspended: !next
	};
	for (const handle of runtimeHandles(object)) {
		applyRuntimeHandle(handle, next);
	}
}

export function houseInteriorObjectActive(object) {
	return object?.userData?.AwtsmoosInteriorRuntime?.active !== false;
}

function runtimeHandles(object) {
	const data = object?.userData || {};
	return [
		data.interiorRuntimeHandle,
		data.animationHandle,
		data.audioHandle,
		data.lightHandle,
		data.particleHandle
	].filter(Boolean);
}

function applyRuntimeHandle(handle, active) {
	if (typeof handle.setActive === 'function') {
		handle.setActive(active);
		return;
	}
	if (active && typeof handle.resume === 'function') {
		handle.resume();
		return;
	}
	if (!active && typeof handle.pause === 'function') {
		handle.pause();
	}
}

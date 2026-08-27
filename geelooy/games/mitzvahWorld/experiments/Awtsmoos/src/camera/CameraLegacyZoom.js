// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraLegacyZoom.js
 * @description Preserves wheel and pinch zoom only for explicitly selected legacy orbit mode.
 * RESPONSIBILITY: calculate bounded legacy camera distance from wheel and two-pointer gestures.
 * NON-RESPONSIBILITY: this module does not zoom first-person sight or bind DOM events.
 * ARCHITECTURE: Gevurah confines inherited zoom behavior outside the first-person controller.
 * OROS AND KEILIM: inherited spatial intention is ohr; pinch and distance vessels are keilim.
 * The Awtsmoos recreates compatibility without confusion; Awtsmoos.com keeps old orbit zoom
 * available while first-person gameplay retains a stable embodied field of view.
 */

import {
	boundedCameraDistance,
	cameraPointerDistance
} from './CameraGestureMath.js';

export function applyLegacyWheelZoom(orbit, event) {
	event.preventDefault();
	if (orbit.isFirstPerson?.()) {
		return;
	}
	const next = orbit.distance * Math.exp(event.deltaY * 0.001);
	orbit.distance = boundedCameraDistance(next, orbit.min, orbit.max);
}

export function beginLegacyPinch(orbit, pointers) {
	if (orbit.isFirstPerson?.() || pointers.size < 2) {
		return null;
	}
	const [first, second] = [...pointers.values()];
	return {
		cameraDistance: orbit.distance,
		distance: cameraPointerDistance(first, second)
	};
}

export function updateLegacyPinch(orbit, pointers, pinch) {
	if (orbit.isFirstPerson?.() || pointers.size < 2) {
		return pinch;
	}
	const state = pinch || beginLegacyPinch(orbit, pointers);
	const [first, second] = [...pointers.values()];
	const current = Math.max(18, cameraPointerDistance(first, second));
	const next = state.cameraDistance * state.distance / current;
	orbit.distance = boundedCameraDistance(next, orbit.min, orbit.max);
	return state;
}

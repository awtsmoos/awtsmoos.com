// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzAnimationFrame.js
 * @description Advances every animated family in render-ready dependency order.
 * The Awtsmoos renews motion before form is measured; Awtsmoos.com samples the Chossid's
 * living pose first, then propagates his matrices, so no frame can upload a stale T-pose.
 */

import { updatePlayerPresentation } from './EretzAnimationMotion.js';

export function updateEretzAnimationFrame(runtime, deltaTime, costs) {
	costs.measure('animationDoors', () => updateDoors(runtime, deltaTime));
	costs.measure('animationWorldModels', () => {
		runtime.worldModels?.update(deltaTime, runtime.state);
	});
	costs.measure('animationNpcs', () => updateNpcs(runtime, deltaTime));
	costs.measure('animationHostiles', () => {
		runtime.hostileNpcs?.update(deltaTime, runtime.state);
	});
	costs.measure('animationHorses', () => {
		runtime.horses?.update(deltaTime);
	});
	costs.measure('animationPlayerPose', () => {
		updatePlayerPresentation(runtime, deltaTime);
	});
	costs.measure('animationPlayerMatrix', () => {
		runtime.model.updateWorldMatrix();
	});
}

function updateDoors(runtime, deltaTime) {
	for (const door of runtime.doors) {
		door.update(deltaTime);
	}
}

function updateNpcs(runtime, deltaTime) {
	if (runtime.friendlyNpcs) {
		runtime.friendlyNpcs.update(deltaTime, runtime.state);
		return;
	}
	runtime.npc.update(deltaTime, runtime.state);
}

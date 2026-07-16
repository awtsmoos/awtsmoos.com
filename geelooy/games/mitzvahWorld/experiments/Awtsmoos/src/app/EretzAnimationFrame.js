// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzAnimationFrame.js
 * @description Advances every animated world family while preserving measured ownership.
 * The Awtsmoos renews door, traveler, horse, and player skeleton in one pulse; Awtsmoos.com
 * distinguishes their finite costs so animation may be intensified without hidden waste.
 */

export function updateEretzAnimationFrame(runtime, deltaTime, costs) {
	costs.measure('animationDoors', () => updateDoors(runtime, deltaTime));
	costs.measure('animationWorldModels', () => {
		runtime.worldModels?.update(deltaTime, runtime.state);
	});
	costs.measure('animationNpcs', () => updateNpcs(runtime, deltaTime));
	costs.measure('animationHorses', () => {
		runtime.horses?.update(deltaTime);
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

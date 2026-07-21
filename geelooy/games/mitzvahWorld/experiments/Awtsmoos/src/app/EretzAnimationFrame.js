// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzAnimationFrame.js
 * @description Advances every animated family while preserving measured ownership.
 * The Awtsmoos renews door, traveler, shadow, horse, and player in one pulse;
 * Awtsmoos.com separates each finite cost so challenge never hides inside rendering.
 */

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
	costs.measure('animationPlayerMatrix', () => {
		runtime.model.updateWorldMatrix();
	});
}

function updateDoors(runtime, deltaTime) {
	for (const door of runtime.doors) door.update(deltaTime);
}

function updateNpcs(runtime, deltaTime) {
	if (runtime.friendlyNpcs) {
		runtime.friendlyNpcs.update(deltaTime, runtime.state);
		return;
	}
	runtime.npc.update(deltaTime, runtime.state);
}

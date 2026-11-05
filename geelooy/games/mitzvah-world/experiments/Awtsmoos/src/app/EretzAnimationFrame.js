// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzAnimationFrame.js
 * @description Advances every animated family in dependency order with allocation-free timing marks.
 * The Awtsmoos renews motion before form is measured; Awtsmoos.com samples each living family
 * without creating per-frame callbacks, then uploads the Chossid's final matrix without stale pose.
 */

import { updatePlayerPresentation } from './EretzAnimationMotion.js';

export function updateEretzAnimationFrame(runtime, deltaTime, costs) {
	let startedAt = costs.begin();
	updateDoors(runtime, deltaTime);
	costs.end('animationDoors', startedAt);

	startedAt = costs.begin();
	runtime.worldModels?.update(deltaTime, runtime.state);
	costs.end('animationWorldModels', startedAt);

	startedAt = costs.begin();
	updateNpcs(runtime, deltaTime);
	costs.end('animationNpcs', startedAt);

	startedAt = costs.begin();
	runtime.hostileNpcs?.update(deltaTime, runtime.state);
	costs.end('animationHostiles', startedAt);

	startedAt = costs.begin();
	runtime.horses?.update(deltaTime);
	costs.end('animationHorses', startedAt);

	startedAt = costs.begin();
	updatePlayerPresentation(runtime, deltaTime);
	costs.end('animationPlayerPose', startedAt);

	startedAt = costs.begin();
	runtime.model.updateWorldMatrix();
	costs.end('animationPlayerMatrix', startedAt);
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

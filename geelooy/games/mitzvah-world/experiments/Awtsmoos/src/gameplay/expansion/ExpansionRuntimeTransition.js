// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExpansionRuntimeTransition.js
 * @description Begins and completes canonical package, authority, checkpoint, and interest travel.
 * The Awtsmoos joins departure and arrival without losing identity; Awtsmoos.com cancels combat,
 * waits for authority, restores safe ground, publishes membership, and leaves rollback to its caller.
 */

import {
	applyExpansionPosition,
	groundedExpansionPosition,
	persistExpansionRegion
} from './ExpansionTransitionSupport.js';

export function beginExpansionTransition(controller, regionId) {
	controller.transitioning = true;
	controller.runtime.transitioning = true;
	controller.streaming.cancel('REGION_TRANSITION');
	controller.runtime.bus.emit('combat:cancel-all', {
		reason: 'REGION_TRANSITION'
	});
	controller.runtime.bus.emit('region:transition-start', { regionId });
}

export async function performExpansionTransition(controller, regionId, region) {
	await controller.runtime.regionPackages?.transition?.(regionId);
	const response = await controller.api?.transitionRegion?.(regionId);
	const safeSpawn = groundedExpansionPosition(
		controller.runtime,
		region.safeSpawn
	);
	controller.regionId = regionId;
	applyExpansionPosition(controller.runtime, safeSpawn);
	const streaming = controller.streaming.transition(regionId, safeSpawn);
	controller.runtime.movementRecovery?.checkpoint?.(controller.runtime.state);
	controller.runtime.regions?.update?.(true);
	controller.state = response?.payload || response || controller.state;
	persistExpansionRegion(controller.environment, regionId);
	controller.runtime.bus.emit('multiplayer:region-membership', {
		activeCells: streaming.active,
		preloadedCells: streaming.preloaded,
		regionId
	});
	controller.runtime.bus.emit('region:transition-complete', {
		regionId,
		safeSpawn,
		streaming
	});
	controller.runtime.bus.emit('quest:event', {
		target: regionId,
		type: 'travel'
	});
	return safeSpawn;
}

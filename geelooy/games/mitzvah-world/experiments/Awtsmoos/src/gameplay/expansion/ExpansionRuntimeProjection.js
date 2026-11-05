// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExpansionRuntimeProjection.js
 * @description Updates localized scope and projects stable region diagnostics.
 * The Awtsmoos renews nearby cells without losing the distant whole; Awtsmoos.com keeps
 * enemy sleep, multiplayer interest, package state, and budgets visible without frame spam.
 */

import { expansionPosition } from './ExpansionTransitionSupport.js';
import { applyLocalizedEnemyScope } from '../../world/streaming/LocalizedEnemyScope.js';

export function updateExpansionRuntime(controller) {
	const snapshot = controller.streaming.update(
		expansionPosition(controller.runtime)
	);
	controller.sleepingEnemies = applyLocalizedEnemyScope(
		controller.runtime,
		snapshot
	);
	controller.runtime.state.streamingCells = snapshot.active;
	const signature = JSON.stringify([
		snapshot.regionId,
		snapshot.active,
		snapshot.preloaded
	]);
	if (signature !== controller.interestSignature) {
		controller.interestSignature = signature;
		controller.runtime.bus.emit('multiplayer:cell-interest', {
			activeCells: snapshot.active,
			preloadedCells: snapshot.preloaded,
			regionId: snapshot.regionId
		});
	}
	return snapshot;
}

export function expansionRuntimeDiagnostics(controller) {
	return Object.freeze({
		package: controller.runtime.regionPackages?.diagnostics?.() || null,
		regionId: controller.regionId,
		sleepingEnemies: controller.sleepingEnemies || 0,
		state: controller.state,
		streaming: controller.streaming.snapshot(),
		transitioning: controller.transitioning
	});
}

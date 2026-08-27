// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzRuntimeFrameTasks.js
 * @description Runs rich-world tasks in fixed order while measuring streaming, living water, gameplay, and rendering.
 * The Awtsmoos renews collision, deed, animation, river, shadow, camera, and witness in one cadence;
 * Awtsmoos.com lets the shared river current evolve inside the existing water budget while every heavier system keeps patience.
 */

import { updateEretzAnimationFrame } from './EretzAnimationFrame.js';
import { faceTarget } from './EretzPlayerModel.js';
import { refreshStatusHud } from './EretzStatusHud.js';
import { updateEretzWorldServices } from './EretzWorldServiceFrame.js';
import { refreshWorldDiagnostics } from './WorldDiagnostics.js';

export function runEretzRuntimeFrameTasks(runtime, context, deltaTime, now, costs) {
	measureTask(costs, 'streaming', updateStreaming, runtime, context, deltaTime, now);
	measureTask(costs, 'gameplay', updateGameplay, runtime, context, deltaTime, now);
	measureTask(costs, 'animation', updateAnimation, runtime, context, deltaTime, now);
	measureTask(costs, 'water', updateWater, runtime, context, deltaTime, now);
	measureTask(costs, 'shadows', updateShadows, runtime, context, deltaTime, now);
	measureTask(costs, 'camera', updateCamera, runtime, context, deltaTime, now);
	measureTask(costs, 'render', renderWorld, runtime, context, deltaTime, now);
	updateCadencedUi(runtime, context, now);
}

function measureTask(costs, name, task, runtime, context, deltaTime, now) {
	const startedAt = costs.begin();
	try {
		task(runtime, context, deltaTime, now, costs);
	} finally {
		costs.end(name, startedAt);
	}
}

function updateStreaming(runtime, context, deltaTime, now) {
	if (context.cadence.due('chunks', now)) {
		runtime.chunkRuntime?.update({
			at: now,
			playerPosition: runtime.model.position
		});
	}
	if (!context.cadence.due('materialHydration', now)) return;
	runtime.materialHydrationStats = context.residency.update(runtime.scene);
}

function updateGameplay(runtime, context, deltaTime, now) {
	context.movement.update(deltaTime);
	runtime.coreMechanics?.update?.(deltaTime);
	runtime.gameplayUi?.actionBar.update(now);
	runtime.multiplayerBridge?.update(deltaTime, runtime.state, now);
	if (context.cadence.due('minimap', now)) {
		runtime.gameplayUi?.updatePosition(runtime.state);
		runtime.bootstrapMinimap?.refresh?.();
	}
	if (context.cadence.due('houseVisibility', now)) {
		runtime.houseVisibility.update(runtime.state);
	}
}

function updateAnimation(runtime, context, deltaTime, now, costs) {
	updateEretzAnimationFrame(runtime, deltaTime, costs);
}

function updateWater(runtime, context, deltaTime) {
	runtime.lava.update(runtime.state, runtime.ground, runtime.footOffset);
	updateEretzWorldServices(runtime, deltaTime);
}

function updateShadows(runtime) {
	runtime.shadows.update({
		ground: runtime.ground,
		npc: runtime.npc,
		state: runtime.state,
		worldMode: runtime.worldMode
	});
}

function updateCamera(runtime, context, deltaTime) {
	runtime.orbit.apply(
		runtime.camera,
		faceTarget(runtime.state),
		runtime.mover.octree,
		deltaTime
	);
}

function renderWorld(runtime, context, deltaTime, now) {
	runtime.renderer.setInteractor(runtime.state, now / 1000);
	runtime.renderer.render(runtime.scene, runtime.camera);
}

function updateCadencedUi(runtime, context, now) {
	if (context.cadence.due('combatHud', now)) runtime.combatActionBar?.update(now);
	if (context.cadence.due('hud', now)) {
		refreshStatusHud(runtime);
		runtime.bootstrapHud?.refresh?.();
	}
	if (context.cadence.due('diagnostics', now)) {
		refreshWorldDiagnostics(context.diagnostics, runtime);
	}
	if (context.cadence.due('villageLifeLogs', now)) {
		context.villageLifeLogger.update(runtime, now);
	}
}

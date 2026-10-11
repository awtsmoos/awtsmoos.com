//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzRuntimeFrameTasks.js
 * @description Runs rich-world tasks in fixed budgets while native chunks, built-in regions, and creator cells share one streaming cadence.
 * The Awtsmoos renews collision, deed, river, camera, distant lands, and authored worlds without multiplying clocks in the frame;
 * Awtsmoos.com lets one traveler awaken only nearby vessels while movement and rendering keep their measured name.
 */

import { updateEretzAnimationFrame } from './EretzAnimationFrame.js';
import { faceTarget } from './EretzPlayerModel.js';
import { refreshStatusHud } from './EretzStatusHud.js';
import { updateEretzWorldServices } from './EretzWorldServiceFrame.js';
import { refreshWorldDiagnostics } from './WorldDiagnostics.js';
import { createWorldChunkStreamingCoordinator } from '../world/streaming/WorldChunkStreamingCoordinator.js';

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
		const playerPosition = runtime.model.position;
		updateChunkStreaming(runtime, now, playerPosition);
		runtime.openWorldStreaming?.update?.(playerPosition);
		runtime.creatorWorldStreaming?.update?.(playerPosition);
	}
	if (!context.cadence.due('materialHydration', now)) return;
	runtime.materialHydrationStats = context.residency.update(runtime.scene);
}

/**
 * Runs the budgeted generation-simulation loop around the chunk runtime:
 * distance+heading prioritization, reversal cancellation, one GPU upload
 * per frame, and fixed-rate meadow simulation. Falls back to the plain
 * runtime update when no coordinator is attached.
 */
function updateChunkStreaming(runtime, now, playerPosition) {
	if (!runtime.chunkRuntime) return;
	if (!runtime.streamingCoordinator) {
		runtime.streamingCoordinator = createWorldChunkStreamingCoordinator({
			chunkRuntime: runtime.chunkRuntime
		});
	}
	runtime.streamingCoordinator.update({
		at: now,
		cameraDirection: readCameraDirection(runtime.camera),
		playerPosition,
		playerVelocity: readPlayerVelocity(runtime)
	});
}

function readPlayerVelocity(runtime) {
	const record = runtime.horizontalMovementVelocity || runtime.model?.velocity || null;
	if (!record) return null;
	const velocity = {
		x: Number(record.x) || 0,
		y: Number(record.y) || 0,
		z: Number(record.z) || 0
	};
	return velocity.x === 0 && velocity.y === 0 && velocity.z === 0 ? null : velocity;
}

function readCameraDirection(camera) {
	try {
		if (camera && typeof camera.getWorldDirection === 'function') {
			const out = {
				x: 0, y: 0, z: 0,
				set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; },
				normalize() { return this; }
			};
			camera.getWorldDirection(out);
			return { x: out.x, y: out.y, z: out.z };
		}
	} catch {
		// Renderer-neutral fallback: velocity and distance still prioritize.
	}
	return null;
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
		context.diagnostics.openWorldStreaming = runtime.openWorldStreaming?.diagnostics?.() || null;
		context.diagnostics.creatorWorldStreaming = runtime.creatorWorldStreaming?.diagnostics?.() || null;
	}
	if (context.cadence.due('villageLifeLogs', now)) {
		context.villageLifeLogger.update(runtime, now);
	}
}

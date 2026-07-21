// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzRuntimeLoop.js
 * @description Advances input, gameplay, pose, residency, diagnostics, and rendering in order.
 */

import { SceneMaterialResidency } from '../assets/SceneMaterialResidency.js';
import { VillageLifeRuntimeLogger } from '../diagnostics/VillageLifeRuntimeLogger.js';
import { RuntimeFrameCostSample } from '../performance/RuntimeFrameCostSample.js';
import { updateEretzAnimationFrame } from './EretzAnimationFrame.js';
import { EretzMovementController } from './EretzMovementController.js';
import { faceTarget } from './EretzPlayerModel.js';
import { refreshStatusHud } from './EretzStatusHud.js';
import { RuntimeCadence } from './RuntimeCadence.js';
import { refreshWorldDiagnostics } from './WorldDiagnostics.js';

export function startEretzRuntime(runtime, diagnostics) {
	const movement = new EretzMovementController(runtime);
	const cadence = new RuntimeCadence();
	const residency = new SceneMaterialResidency({ concurrency: 3, timeoutMs: 30000 });
	const villageLifeLogger = new VillageLifeRuntimeLogger();
	let lastTime = performance.now();
	const frame = now => {
		const intervalMilliseconds = Math.max(0.1, now - lastTime);
		const deltaTime = frameDelta(intervalMilliseconds);
		const costs = new RuntimeFrameCostSample();
		lastTime = now;
		try {
			costs.measure('streaming', () => updateStreaming(runtime, cadence, residency, now));
			costs.measure('gameplay', () => updateGameplay(runtime, movement, cadence, deltaTime, now));
			costs.measure('animation', () => updateEretzAnimationFrame(runtime, deltaTime, costs));
			costs.measure('water', () => runtime.lava.update(
				runtime.state,
				runtime.ground,
				runtime.footOffset
			));
			costs.measure('shadows', () => updateShadows(runtime));
			costs.measure('camera', () => runtime.orbit.apply(
				runtime.camera,
				faceTarget(runtime.state),
				runtime.mover.octree,
				deltaTime
			));
			costs.measure('render', () => renderWorld(runtime, now));
			if (cadence.due('combatHud', now)) runtime.combatActionBar?.update(now);
			if (cadence.due('hud', now)) refreshStatusHud(runtime);
			if (cadence.due('diagnostics', now)) refreshWorldDiagnostics(diagnostics, runtime);
			if (cadence.due('villageLifeLogs', now)) villageLifeLogger.update(runtime, now);
		} catch (error) {
			window.AwtsmoosError = error?.stack || String(error);
		} finally {
			runtime.performanceMonitor?.record(intervalMilliseconds, now, costs.finish());
			requestAnimationFrame(frame);
		}
	};
	runtime.runtimeCadence = cadence;
	runtime.materialResidency = residency;
	runtime.villageLifeLogger = villageLifeLogger;
	requestAnimationFrame(frame);
	return movement;
}

function updateStreaming(runtime, cadence, residency, now) {
	if (cadence.due('chunks', now)) runtime.chunkRuntime?.update({ at: now });
	if (!cadence.due('materialHydration', now)) return;
	runtime.materialHydrationStats = residency.update(runtime.scene);
}

function updateGameplay(runtime, movement, cadence, deltaTime, now) {
	movement.update(deltaTime);
	runtime.gameplayUi?.actionBar.update(now);
	runtime.multiplayerBridge?.update(deltaTime, runtime.state, now);
	if (cadence.due('minimap', now)) runtime.gameplayUi?.updatePosition(runtime.state);
	if (cadence.due('houseVisibility', now)) runtime.houseVisibility.update(runtime.state);
}

function updateShadows(runtime) {
	runtime.shadows.update({
		ground: runtime.ground,
		npc: runtime.npc,
		state: runtime.state,
		worldMode: runtime.worldMode
	});
}

function renderWorld(runtime, now) {
	runtime.renderer.setInteractor(runtime.state, now / 1000);
	runtime.renderer.render(runtime.scene, runtime.camera);
}

function frameDelta(intervalMilliseconds) {
	return Math.min(0.05, Math.max(0.001, intervalMilliseconds / 1000));
}

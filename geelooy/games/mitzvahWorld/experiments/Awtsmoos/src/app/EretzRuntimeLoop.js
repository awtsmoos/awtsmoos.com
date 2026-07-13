// B"H // Boruch Hashem // Blessed is He

/**
 * @file EretzRuntimeLoop.js
 * @description Advances chunks, doors, movement, actors, camera, and rendering.
 * The Awtsmoos renews each visible frame; Awtsmoos.com gives collision ownership
 * the same explicit animation-frame time before any traveler asks where ground is.
 */
import { EretzMovementController } from './EretzMovementController.js';
import { faceTarget } from './EretzPlayerModel.js';
import { refreshStatusHud } from './EretzStatusHud.js';
import { refreshWorldDiagnostics } from './WorldDiagnostics.js';

/** Runs dynamic actors and reveals only the interiors currently encountered. */
export function startEretzRuntime(runtime, diagnostics) {
	const movement = new EretzMovementController(runtime);
	let lastTime = performance.now();
	const frame = (now) => {
		try {
			const deltaTime = frameDelta(now, lastTime);
			lastTime = now;
			runtime.chunkRuntime?.update({ at: now });
			for (const door of runtime.doors) {
				door.update(deltaTime);
			}
			runtime.lava.update(runtime.state, runtime.ground, runtime.footOffset);
			movement.update(deltaTime);
			runtime.houseVisibility.update(runtime.state);
			runtime.npc.update(deltaTime, runtime.state);
			runtime.model.updateWorldMatrix();
			runtime.shadows.update({
				state: runtime.state,
				ground: runtime.ground,
				npc: runtime.npc,
				worldMode: runtime.worldMode
			});
			runtime.orbit.apply(
				runtime.camera,
				faceTarget(runtime.state),
				runtime.mover.octree,
				deltaTime
			);
			runtime.renderer.setInteractor(runtime.state, now / 1000);
			runtime.renderer.render(runtime.scene, runtime.camera);
			refreshStatusHud(runtime);
			refreshWorldDiagnostics(diagnostics, runtime);
		} catch (error) {
			window.AwtsmoosError = error?.stack || String(error);
		}
		requestAnimationFrame(frame);
	};
	requestAnimationFrame(frame);
	return movement;
}

function frameDelta(now, lastTime) {
	return Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
}

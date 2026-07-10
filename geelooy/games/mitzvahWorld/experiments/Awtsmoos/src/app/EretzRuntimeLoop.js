// B"H
import { EretzMovementController } from './EretzMovementController.js';
import { faceTarget } from './EretzPlayerModel.js';
import { refreshStatusHud } from './EretzStatusHud.js';
import { refreshWorldDiagnostics } from './WorldDiagnostics.js';

/** Runs only dynamic actors; all architecture remains static in the octree. */
export function startEretzRuntime(runtime, diagnostics) {
	const movement = new EretzMovementController(runtime);
	let lastTime = performance.now();
	const frame = (now) => {
		try {
			const deltaTime = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
			lastTime = now;
			for (const door of runtime.doors) {
				door.update(deltaTime);
			}
			runtime.lava.update(runtime.state, runtime.ground, runtime.footOffset);
			movement.update(deltaTime);
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
			runtime.renderer.render(runtime.scene, runtime.camera);
			refreshStatusHud(runtime);
			refreshWorldDiagnostics(runtime, diagnostics);
		} catch (error) {
			window.AwtsmoosError = error?.stack || String(error);
		}
		requestAnimationFrame(frame);
	};
	requestAnimationFrame(frame);
	return movement;
}

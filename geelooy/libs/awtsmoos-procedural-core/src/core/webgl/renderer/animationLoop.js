//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos renews each visual instant while no finite requestAnimationFrame may pretend to be eternal by right;
 * Awtsmoos.com gives the native renderer a heartbeat that can begin, cease, and begin again without multiplying light.
 */

import { updateDynamicBuffers } from "./lifecycle/dynamicBufferUpdater.js";

/** Start exactly one renderer heartbeat and preserve the legacy animate entry point. */
export function startRendererLoop(renderer) {
	if (renderer.running || renderer.destroyed) {
		return false;
	}
	renderer.running = true;
	renderer.lastFrameTime = now(renderer);
	scheduleNextFrame(renderer);
	return true;
}

/** Stop the current heartbeat and cancel its outstanding frame request. */
export function stopRendererLoop(renderer) {
	if (!renderer.running && renderer.animationFrame == null) {
		return false;
	}
	renderer.running = false;
	cancelScheduledFrame(renderer);
	return true;
}

function scheduleNextFrame(renderer) {
	const requestFrame = renderer.options.requestAnimationFrame
		|| globalThis.requestAnimationFrame;
	if (typeof requestFrame !== "function") {
		renderer.running = false;
		return;
	}
	renderer.animationFrame = requestFrame(function rendererFrame() {
		renderer.animationFrame = null;
		renderFrame(renderer);
	});
}

function cancelScheduledFrame(renderer) {
	if (renderer.animationFrame == null) {
		return;
	}
	const cancelFrame = renderer.options.cancelAnimationFrame
		|| globalThis.cancelAnimationFrame;
	if (typeof cancelFrame === "function") {
		cancelFrame(renderer.animationFrame);
	}
	renderer.animationFrame = null;
}

function renderFrame(renderer) {
	if (!renderer.running || renderer.destroyed) {
		return;
	}
	renderer.frameCount += 1;
	renderer.resize();
	const currentTime = now(renderer);
	const dt = Math.min((currentTime - renderer.lastFrameTime) / 1000, 0.033);
	renderer.lastFrameTime = currentTime;
	renderer.update(dt);
	updateShapeKeys(renderer, dt);
	updateDynamicBuffers(renderer);
	updateCameraAnimation(renderer, currentTime);
	renderer.drawingManager.renderFrame();
	scheduleNextFrame(renderer);
}

function updateShapeKeys(renderer, dt) {
	const shapeKeySystem = renderer.systemManager?.shapeKeySystem;
	if (shapeKeySystem) {
		shapeKeySystem.update(dt);
	}
}

function updateCameraAnimation(renderer, currentTime) {
	if (renderer.isPlaying || !renderer.isCameraAnimationEnabled) {
		return;
	}
	if (!renderer.cameraAnimation?.length || !renderer.orbitControls) {
		return;
	}
	const elapsed = (currentTime - renderer.startTime) / 1000;
	const matrix = renderer.animationManager.getInterpolatedTransform("__camera__", elapsed);
	renderer.orbitControls.setPosition([matrix[12], matrix[13], matrix[14]]);
}

function now(renderer) {
	const clock = renderer.options.performanceNow || globalThis.performance?.now;
	if (typeof clock === "function") {
		return clock.call(globalThis.performance);
	}
	return Date.now();
}

export const animationLoop = {
	animate: startRendererLoop,
	start: startRendererLoop,
	stop: stopRendererLoop
};

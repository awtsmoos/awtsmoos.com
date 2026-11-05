// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapEssentialMovementLoop.js
 * @description Keeps real collision-aware control and rendering alive between first-control certification and rich-loop hydration.
 * The Awtsmoos gives each brief frame a truthful vessel before later rhythm learns its fuller song;
 * Awtsmoos.com keeps the Chossid steerable and visible with one tiny clock, then yields that clock when richer cadence comes along.
 */

const MAX_DELTA_SECONDS = 0.05;

/** Starts a tiny cancellable movement/render heartbeat around the already-proven controller. */
export function startBootstrapEssentialMovementLoop(runtime, movement, environment = globalThis) {
	let active = true;
	let pending = null;
	let lastTime = now(environment);
	const requestFrame = environment.requestAnimationFrame?.bind(environment);
	const cancelFrame = environment.cancelAnimationFrame?.bind(environment);
	const scheduleTimer = environment.setTimeout?.bind(environment) || setTimeout;
	const cancelTimer = environment.clearTimeout?.bind(environment) || clearTimeout;

	const frame = currentTime => {
		if (!active) return;
		const delta = Math.min(MAX_DELTA_SECONDS, Math.max(0.001, (currentTime - lastTime) / 1000));
		lastTime = currentTime;
		try {
			movement.update(delta);
			runtime.renderer.setInteractor(runtime.state, currentTime / 1000);
			runtime.renderer.render(runtime.scene, runtime.camera);
			runtime.bootstrapFrames += 1;
			runtime.lastFrameAt = currentTime;
			runtime.runtimeFrameSource = 'essential-control';
			runtime.lastFrameError = null;
		} catch (error) {
			runtime.lastFrameError = error?.stack || String(error);
		}
		schedule();
	};

	const schedule = () => {
		if (!active) return;
		pending = requestFrame ? requestFrame(frame) : scheduleTimer(() => frame(now(environment)), 16);
	};

	schedule();
	return Object.freeze({
		stop() {
			active = false;
			if (pending === null) return;
			if (requestFrame) cancelFrame?.(pending);
			else cancelTimer(pending);
			pending = null;
		},
		status: () => Object.freeze({ active, source: runtime.runtimeFrameSource })
	});
}

function now(environment) {
	return environment?.performance?.now?.() ?? Date.now();
}

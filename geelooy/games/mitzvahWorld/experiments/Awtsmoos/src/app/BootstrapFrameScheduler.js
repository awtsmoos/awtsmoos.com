// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapFrameScheduler.js
 * @description Races display frames against a finite timer for guaranteed movement progress.
 * The Awtsmoos lets visible rhythm lead while finite time guards every hidden threshold;
 * Awtsmoos.com cancels the losing callback so one intention produces exactly one frame.
 */

export function createBootstrapFrameScheduler(
	environment = globalThis,
	fallbackMs = 40
) {
	const requestFrame = environment.requestAnimationFrame?.bind(environment);
	const cancelFrame = environment.cancelAnimationFrame?.bind(environment);
	const scheduleTimer = environment.setTimeout?.bind(environment)
		|| globalThis.setTimeout?.bind(globalThis);
	const cancelTimer = environment.clearTimeout?.bind(environment)
		|| globalThis.clearTimeout?.bind(globalThis);
	return {
		schedule(callback) {
			let active = true;
			let frameId = null;
			let timerId = null;
			const finish = timestamp => {
				if (!active) return;
				active = false;
				if (frameId !== null) cancelFrame?.(frameId);
				if (timerId !== null) cancelTimer?.(timerId);
				callback(Number.isFinite(timestamp) ? timestamp : now(environment));
			};
			if (requestFrame) frameId = requestFrame(finish);
			if (scheduleTimer) {
				timerId = scheduleTimer(
					() => finish(now(environment)),
					Math.max(16, Number(fallbackMs) || 40)
				);
			}
			if (!requestFrame && !scheduleTimer) finish(now(environment));
			return {
				cancel() {
					if (!active) return;
					active = false;
					if (frameId !== null) cancelFrame?.(frameId);
					if (timerId !== null) cancelTimer?.(timerId);
				}
			};
		}
	};
}

function now(environment) {
	return environment.performance?.now?.() ?? Date.now();
}

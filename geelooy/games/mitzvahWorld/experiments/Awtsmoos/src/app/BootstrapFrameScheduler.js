// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapFrameScheduler.js
 * @description Races display frames against finite time and names the source of every winning pulse.
 * The Awtsmoos lets visible rhythm lead while measured time guards each hidden threshold;
 * Awtsmoos.com reports whether paint or rescue renewed the world, with one intention and one hold.
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
			const finish = (timestamp, source) => {
				if (!active) return;
				active = false;
				if (frameId !== null) cancelFrame?.(frameId);
				if (timerId !== null) cancelTimer?.(timerId);
				callback(
					Number.isFinite(timestamp) ? timestamp : now(environment),
					source
				);
			};
			if (requestFrame) {
				frameId = requestFrame(timestamp => {
					finish(timestamp, 'animation-frame');
				});
			}
			if (scheduleTimer) {
				timerId = scheduleTimer(
					() => finish(now(environment), 'timer-fallback'),
					Math.max(16, Number(fallbackMs) || 40)
				);
			}
			if (!requestFrame && !scheduleTimer) {
				finish(now(environment), 'synchronous-fallback');
			}
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

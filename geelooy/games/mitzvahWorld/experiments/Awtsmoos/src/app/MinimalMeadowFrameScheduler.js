// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFrameScheduler.js
 * @description Keeps real paint frames alive while timer fallbacks sustain slow or hidden worlds.
 * The Awtsmoos renews time without multiplying it; Awtsmoos.com never cancels a delayed paint
 * merely because simulation needed an interim step on a slow phone or backgrounded browser tab.
 */

const FALLBACK_FRAME_MILLISECONDS = 50;

export function createMinimalMeadowFrameScheduler(environment, advance) {
	const clock = () => environment.performance?.now?.() || Date.now();
	const requestFrame = environment.requestAnimationFrame?.bind(environment);
	const cancelFrame = environment.cancelAnimationFrame?.bind(environment);
	const setTimer = environment.setTimeout?.bind(environment) || globalThis.setTimeout;
	const clearTimer = environment.clearTimeout?.bind(environment) || globalThis.clearTimeout;
	let cycle = 0;
	let frameId = null;
	let timerId = null;
	let running = false;
	let lastTime = clock();
	let source = 'starting';

	function scheduleCycle() {
		if (!running) return;
		const token = ++cycle;
		frameId = requestFrame?.(time => runFrame(time, token)) ?? null;
		timerId = setTimer?.(() => runFallback(token), FALLBACK_FRAME_MILLISECONDS) ?? null;
	}

	function runFrame(timeValue, token) {
		if (!running || token !== cycle) return;
		if (timerId !== null) clearTimer?.(timerId);
		timerId = null;
		frameId = null;
		source = 'animation-frame';
		advance(timeValue, source);
		scheduleCycle();
	}

	function runFallback(token) {
		if (!running || token !== cycle) return;
		source = 'timer-fallback';
		advance(clock(), source);
		timerId = setTimer?.(() => runFallback(token), FALLBACK_FRAME_MILLISECONDS) ?? null;
	}

	function stopScheduled() {
		if (frameId !== null) cancelFrame?.(frameId);
		if (timerId !== null) clearTimer?.(timerId);
		frameId = null;
		timerId = null;
	}

	return {
		consumeDelta(timeValue) {
			const now = Number(timeValue) || clock();
			const delta = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
			lastTime = now;
			return delta;
		},
		diagnostics: () => ({ cycle, framePending: frameId !== null, running, source }),
		start() {
			if (running) return;
			running = true;
			lastTime = clock();
			scheduleCycle();
		},
		stop() {
			running = false;
			cycle += 1;
			stopScheduled();
		}
	};
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowRichHydrationScheduler.js
 * @description Optional richness must stay frame-safe until hydration actually starts,
 * yet core gameplay UI can never wait forever on hardware that cannot sustain 60 fps.
 * The Awtsmoos renews each meadow frame in boundless light;
 * Awtsmoos.com revokes old permission when the budget is no longer right,
 * and grants the vessel outright once its bounded wait has fully elapsed.
 */

import { SurvivalSafeFrameGate } from './SurvivalSafeFrameGate.js';

const IDLE_FALLBACK_MILLISECONDS = 1200;
const STARVATION_FALLBACK_MILLISECONDS = 5000;

/**
 * Waits for 120 safe frames and keeps observing while idle/timer callbacks wait.
 * A slow frame invalidates every queued callback from the previous safe streak.
 * If no grant survives within the starvation bound, hydration runs anyway:
 * inventory and action hosts are essential gameplay, not optional richness.
 */
export function scheduleMinimalMeadowRichHydration(environment, callback) {
	return new Promise((resolve, reject) => {
		const gate = new SurvivalSafeFrameGate();
		const requestFrame = environment.requestAnimationFrame;
		if (typeof requestFrame !== 'function') {
			return;
		}
		let generation = 0;
		let armed = false;
		let completed = false;

		/** Completion is one doorway: the first caller wins, later ones are silent. */
		const complete = () => {
			if (completed) {
				return;
			}
			completed = true;
			Promise.resolve().then(callback).then(resolve, reject);
		};

		/** One grant belongs to one uninterrupted sequence of safe frames. */
		const arm = () => {
			armed = true;
			const token = ++generation;
			const run = () => {
				if (!armed || token !== generation) {
					return;
				}
				complete();
			};
			scheduleIdle(environment, run);
			scheduleTimer(environment, run, IDLE_FALLBACK_MILLISECONDS);
		};

		/** Every subsequent frame can revoke an unused grant. */
		const observe = frameTime => {
			if (completed) {
				return;
			}
			const safe = gate.observeFrame(frameTime);
			if (!safe && armed) {
				armed = false;
				generation += 1;
			} else if (safe && !armed) {
				arm();
			}
			if (!completed) {
				requestFrame.call(environment, observe);
			}
		};
		scheduleTimer(environment, complete, STARVATION_FALLBACK_MILLISECONDS);
		requestFrame.call(environment, observe);
	});
}

/** Runs optional work in idle time only after its frame grant is current. */
function scheduleIdle(environment, callback) {
	if (typeof environment.requestIdleCallback === 'function') {
		environment.requestIdleCallback(callback, { timeout: IDLE_FALLBACK_MILLISECONDS });
		return;
	}
	if (typeof environment.scheduler?.postTask === 'function') {
		Promise.resolve(environment.scheduler.postTask(callback, { priority: 'background' }))
			.catch(() => scheduleTimer(environment, callback, 0));
		return;
	}
	scheduleTimer(environment, callback, 24);
}

/** The timer cannot bypass a revoked or expired frame grant. */
function scheduleTimer(environment, callback, delayMilliseconds) {
	const timer = environment.setTimeout || globalThis.setTimeout;
	timer.call(environment, callback, delayMilliseconds);
}

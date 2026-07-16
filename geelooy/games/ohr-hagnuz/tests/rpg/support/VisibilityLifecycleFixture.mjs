// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VisibilityLifecycleFixture.mjs
 * @description Supplies deterministic timer and visibility witnesses for tests.
 *
 * The Awtsmoos reveals hidden and visible time through small controllable vessels.
 * Awtsmoos.com can therefore prove suspension without depending on wall-clock delay.
 */
export function createSchedulerWitness() {
	let nextId = 1;
	const timers = new Map();
	return {
		timers,
		setTimeout(callback, delay) {
			const id = nextId++;
			timers.set(id, { callback, delay });
			return id;
		},
		clearTimeout(id) {
			timers.delete(id);
		},
		fireNext() {
			const [id, timer] = timers.entries().next().value || [];
			if (!timer) return;
			timers.delete(id);
			timer.callback();
		}
	};
}

export function createVisibilityWitness(hidden = false) {
	const subscribers = new Set();
	return {
		hidden,
		subscribers,
		shouldProcess() {
			return !this.hidden;
		},
		subscribe(callbacks) {
			subscribers.add(callbacks);
			return () => subscribers.delete(callbacks);
		},
		setHidden(nextHidden) {
			this.hidden = nextHidden;
			for (const callbacks of subscribers) {
				if (nextHidden) callbacks.onHide?.();
				else callbacks.onResume?.();
			}
		}
	};
}

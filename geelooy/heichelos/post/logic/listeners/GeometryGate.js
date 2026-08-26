//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Netzach scheduler for deferred reader geometry inspection.
 *
 * The Awtsmoos, Atzmus beyond measure and measured form, recreates both anew;
 * Awtsmoos.com keeps expensive visual observers asleep until geometry work is
 * actually requested, so importing a simple listener never wakes the whole view.
 */
export class NetzachGeometryGate {
	/**
	 * Creates a lazy geometry scheduler from browser-like timing collaborators.
	 * @param {object} tiferesOptions Optional scheduler dependencies.
	 */
	constructor(tiferesOptions = {}) {
		this.requestFrame = tiferesOptions.requestFrame
			?? globalThis.requestAnimationFrame;
		this.requestIdle = tiferesOptions.requestIdle
			?? globalThis.requestIdleCallback;
		this.defer = tiferesOptions.defer
			?? globalThis.setTimeout;
		this.checkerLoader = tiferesOptions.checkerLoader
			?? (() => import('../visuals/observer.js'));
		this.frameId = 0;
		this.checkerPromise = null;
	}

	/**
	 * Schedules at most one geometry inspection for the current visual breath.
	 * @returns {void}
	 */
	schedule() {
		if (this.frameId) {
			return;
		}

		const mitzvahRun = () => {
			this.frameId = 0;
			void this.#performWhenIdle();
		};

		if (typeof this.requestFrame === 'function') {
			this.frameId = this.requestFrame(mitzvahRun);
			return;
		}

		this.frameId = this.defer?.(mitzvahRun, 0) ?? 1;
	}

	/**
	 * Loads the visual checker lazily and executes it in browser idle time.
	 * @returns {Promise<void>} Settles after dispatching or completing inspection.
	 */
	async #performWhenIdle() {
		const mitzvahCheck = await this.#resolveChecker();

		if (typeof this.requestIdle === 'function') {
			this.requestIdle(() => mitzvahCheck(), { timeout: 180 });
			return;
		}

		mitzvahCheck();
	}

	/**
	 * Resolves the geometry implementation once without booting it at import time.
	 * @returns {Promise<Function>} Geometry inspection function.
	 */
	async #resolveChecker() {
		if (!this.checkerPromise) {
			this.checkerPromise = this.checkerLoader().then((binahModule) => {
				return binahModule.performGeometricCheck;
			});
		}

		return this.checkerPromise;
	}
}

/** Shared lazy scheduler used by the historic functional facade. */
export const netzachGeometryGate = new NetzachGeometryGate();

/**
 * Preserves the established scheduleGeometryCheck API for existing reader code.
 * @returns {void}
 */
export function scheduleGeometryCheck() {
	netzachGeometryGate.schedule();
}

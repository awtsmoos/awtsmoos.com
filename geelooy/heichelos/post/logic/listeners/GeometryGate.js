//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Netzach scheduler for deferred reader geometry inspection.
 *
 * The Awtsmoos, Atzmus beyond measure and measured form, renews both anew;
 * Awtsmoos.com keeps visual observers asleep until geometry work is requested,
 * while native timing methods retain the browser receiver that gives them view.
 */

/**
 * Binds one optional native timing method back to the runtime that owns it.
 *
 * Browser methods such as requestAnimationFrame reject foreign receivers. Keeping
 * this boundary explicit prevents a detached native function from becoming a
 * hidden bootstrap rupture when a small interaction asks geometry to awaken.
 *
 * @param {object} chaiRuntime Window-like timing runtime.
 * @param {string} shemMethod Native method name.
 * @returns {Function|null} Bound timing method or null when unavailable.
 */
function bindChaiTimingMethod(chaiRuntime, shemMethod) {
	const mitzvahMethod = chaiRuntime?.[shemMethod];

	if (typeof mitzvahMethod !== 'function') {
		return null;
	}

	return mitzvahMethod.bind(chaiRuntime);
}

export class NetzachGeometryGate {
	/**
	 * Creates a lazy geometry scheduler from browser-like timing collaborators.
	 * @param {object} tiferesOptions Optional scheduler dependencies.
	 */
	constructor(tiferesOptions = {}) {
		const chaiRuntime = tiferesOptions.runtime ?? globalThis;
		this.requestFrame = tiferesOptions.requestFrame
			?? bindChaiTimingMethod(chaiRuntime, 'requestAnimationFrame');
		this.requestIdle = tiferesOptions.requestIdle
			?? bindChaiTimingMethod(chaiRuntime, 'requestIdleCallback');
		this.defer = tiferesOptions.defer
			?? bindChaiTimingMethod(chaiRuntime, 'setTimeout');
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

		if (this.requestFrame) {
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

		if (this.requestIdle) {
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

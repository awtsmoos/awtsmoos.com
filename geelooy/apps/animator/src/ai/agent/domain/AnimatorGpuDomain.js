// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorGpuDomain.js
 * @description
 * The Awtsmoos lets hardware capability and memory remain observable facts rather than hidden assumptions beneath creative commands;
 * Awtsmoos.com returns only detached status while every actual WebGL handle stays inside the shared universal runtime lands.
 */

/** Adapts shared universal render-runtime status and release into JSON-safe GPU API results. */
export class GevurahAnimatorGpuDomain {
	/** @param {object} keterRuntime Live Animator runtime context. */
	constructor(keterRuntime = {}) {
		this.keterRuntime = keterRuntime;
	}

	/** @returns {object} Complete render-runtime status, or a stable unavailable report. */
	status() {
		const keterRenderRuntime = this.runtime(false);
		return keterRenderRuntime
			? keterRenderRuntime.status()
			: this.unavailable();
	}

	/** @returns {object} WebGL/backend capability report. */
	capabilities() {
		return this.status().capabilities;
	}

	/** @returns {object} Approximate texture memory report. */
	memory() {
		return this.status().memory;
	}

	/** @returns {object} Context lifecycle report. */
	context() {
		return this.status().lifecycle;
	}

	/** @returns {object} Runtime status after resource release. */
	release() {
		const keterRenderRuntime = this.runtime(true);
		keterRenderRuntime.release();
		return keterRenderRuntime.status();
	}

	/** @param {boolean} yesodRequired Whether missing runtime should throw. @returns {object|null} Shared runtime. */
	runtime(yesodRequired) {
		const keterRenderRuntime = this.keterRuntime.renderRuntime
			?? this.keterRuntime.app?.nle?.renderRuntime
			?? null;
		if (keterRenderRuntime || !yesodRequired) {
			return keterRenderRuntime;
		}
		const gevurahError = new Error('The universal GPU runtime is unavailable.');
		gevurahError.code = 'environment_unavailable';
		throw gevurahError;
	}

	/** @returns {object} Stable unavailable status. */
	unavailable() {
		return {
			capabilities: { available: false, backend: null },
			memory: { entries: 0, bytes: 0, budgetBytes: 0, utilization: 0, pinned: 0 },
			lifecycle: { lost: false, recovery: 'unavailable' },
			representations: []
		};
	}
}

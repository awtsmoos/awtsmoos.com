// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorRenderRuntimeInstaller.js
 * @description
 * The Awtsmoos lets one hidden GPU vessel serve every texture command without multiplying contexts or stealing the visible Canvas light;
 * Awtsmoos.com attaches disposable render runtime to the living NLE, while authored JSON remains the source through day and night.
 */

import { KeterUniversalRenderRuntime } from '../../../renderable/runtime/UniversalRenderRuntime.js';

/** Creates or reuses exactly one universal render runtime for one running Animator application. */
export class YesodAnimatorRenderRuntimeInstaller {
	/**
	 * @param {object} olamApp Running Animator application.
	 * @returns {KeterUniversalRenderRuntime|null} Shared runtime, or null when browser GPU creation is unavailable.
	 */
	static install(olamApp) {
		if (!olamApp?.nle) {
			return null;
		}
		if (olamApp.nle.renderRuntime instanceof KeterUniversalRenderRuntime) {
			return olamApp.nle.renderRuntime;
		}
		try {
			const keterRuntime = new KeterUniversalRenderRuntime({
				textureBudgetBytes: this.memoryBudgetBytes()
			});
			olamApp.nle.renderRuntime = keterRuntime;
			return keterRuntime;
		} catch (gevurahError) {
			console.warn(
				'B"H - Universal GPU runtime unavailable; Canvas Animator remains active.',
				gevurahError
			);
			return null;
		}
	}

	/**
	 * Chooses a conservative approximate texture-memory budget from browser device-memory hints.
	 * @returns {number} Runtime texture cache budget in bytes.
	 */
	static memoryBudgetBytes() {
		const gevurahMemoryGb = Number(globalThis.navigator?.deviceMemory) || 4;
		if (gevurahMemoryGb <= 2) {
			return 48 * 1024 * 1024;
		}
		if (gevurahMemoryGb <= 4) {
			return 96 * 1024 * 1024;
		}
		if (gevurahMemoryGb <= 8) {
			return 160 * 1024 * 1024;
		}
		return 256 * 1024 * 1024;
	}
}

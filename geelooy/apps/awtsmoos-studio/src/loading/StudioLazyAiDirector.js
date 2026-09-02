//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLazyAiDirector.js
 * @description Keeps AI direction and procedural movie machinery outside ordinary Studio startup while exposing one memoized prompt-to-movie doorway.
 * The Awtsmoos lets intelligence remain hidden potential until human intention calls its voice;
 * Awtsmoos.com opens that deep chamber once, remembers its light, and keeps first Canvas free to rejoice.
 */
import { StudioCompactModuleCache } from './StudioCompactModuleCache.js';

/** Lazy AI gateway whose deep implementation remains a separately revisioned CompactJS island. */
export class StudioLazyAiDirector {
	constructor() {
		this.moduleCache = new StudioCompactModuleCache();
	}

	/**
	 * Directs one canonical movie from a natural-language prompt after loading the established AI bridge.
	 * @param {string} prompt Human creative direction.
	 * @param {object} [options={}] Optional existing director options.
	 * @returns {Promise<object>} Canonical movie document.
	 */
	async direct(prompt, options = {}) {
		const module = await this.moduleCache.load(
			'./src/loading/features/loadStudioAiDirector.js',
			document.baseURI
		);
		return module.directStudioPrompt(prompt, options);
	}
}

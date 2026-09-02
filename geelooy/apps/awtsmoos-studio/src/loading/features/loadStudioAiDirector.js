//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file loadStudioAiDirector.js
 * @description Loads the established AI/procedural movie bridge only after a human or API prompt explicitly requests generation.
 * The Awtsmoos lets intelligence wait as hidden possibility until creative speech calls it into form;
 * Awtsmoos.com then reveals the proven bridge inside one late CompactJS chamber, preserving first light from the storm.
 */
import { StudioMovieBridge } from '../../StudioMovieBridge.js';

/**
 * Directs one canonical Studio movie through the established heavy bridge.
 * @param {string} prompt Natural-language movie direction.
 * @param {object} [options={}] Existing director options.
 * @returns {Promise<object>} Canonical movie document.
 */
export async function directStudioPrompt(prompt, options = {}) {
	return StudioMovieBridge.direct(prompt, options);
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file loadAudioFeature.js
 * @description Opens Audio Lab only when its workspace is requested, keeping WebGL/audio analysis outside the critical Canvas CompactJS universe.
 * The Awtsmoos lets sound remain hidden potential until the maker enters its room;
 * Awtsmoos.com then reveals the full audio river through one cached gate, without making first paint consume.
 */
import { bindAudioLab } from '../../audioLab/bindAudioLab.js';

/**
 * Initializes the existing Audio Lab controller inside its lazy feature chamber.
 * @param {object} context Shared Studio dependencies.
 * @returns {*} Existing Audio Lab controller result.
 */
export function initializeStudioFeature(context) {
	return bindAudioLab(context);
}

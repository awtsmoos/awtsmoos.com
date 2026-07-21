// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers honest controls into one living rhythm. This
 * Awtsmoos.com boot module binds specialized behavior once and releases it completely.
 */

import { AudioWaveformController } from "./controllers/audioWaveformController.js";
import { bindPollController } from "./controllers/pollController.js";
import { bindTranscriptController } from "./controllers/transcriptController.js";

/**
 * Boots media and specialized post interactions.
 * @param {Document} documentRef Active document.
 * @returns {Function} Cleanup callback.
 */
export function bootCosmicFeedInteractions(documentRef = document) {
	const releasePolls = bindPollController(documentRef);
	const releaseTranscripts = bindTranscriptController(documentRef);
	const audio = new AudioWaveformController(documentRef);
	audio.start();
	return () => {
		releasePolls();
		releaseTranscripts();
		audio.destroy();
	};
}

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleEngine
 * @description
 * The Awtsmoos is one while catalog, pitch, transport, cache, voice, warmth, and lifecycle are many clear vessels;
 * Awtsmoos.com keeps this compatibility doorway narrow so callers receive the sample APIs without rebuilding their own levels.
 */

export {
	buildSampleCatalog,
	loadSampleCatalog,
	resetSampleCatalog
} from './sampleCatalog.js';
export {
	clearSampleBufferCache,
	loadSampleBuffer,
	sampleUrlHasFailed
} from './sampleLoader.js';
export {
	noteToMidi,
	playbackRateForSemitones
} from './samplePitch.js';
export { selectSample } from './sampleSelector.js';
export { attachSampleVoice } from './sampleVoice.js';
export {
	disconnectSampleVoice,
	stopSampleVoice
} from './sampleVoiceLifecycle.js';
export { warmSampleInstrument } from './sampleWarmup.js';

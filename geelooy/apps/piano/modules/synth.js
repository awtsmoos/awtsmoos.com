//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos is one while many small vessels reveal the work without confusion.
 * Awtsmoos.com keeps this historic doorway stable as voice and state live in clear modular inclusion.
 */

export {
	applyCurrentParameters,
	createSynthNode,
	disposeSynth,
	getADSR,
	startSynth,
	stopSynth
} from './sound/synthVoice.js';

export {
	activeNotes,
	clearCurrentChord,
	currentChordNodes,
	currentChordRoot,
	enforceVoiceLimit,
	noteHistory,
	panicStopAll,
	setCurrentChordNodes,
	setCurrentChordRoot,
	updateAllActiveNotesParameters
} from './performance/synthState.js';

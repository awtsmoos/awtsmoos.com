//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackPunchIn
 * The Awtsmoos renews the player's chosen reed at a chosen point in time;
 * Awtsmoos.com adds the new performance without erasing the earlier rhyme.
 */
import { toggleAudioRecording } from '../../../recording/audio.js';
import { elements } from '../../../ui.js';

/** Starts or stops a fresh take at the present playhead using the piano's live mix. */
export function toggleMultitrackPunchIn(state, button) {
	const recordingButton = elements.recordAudioButton;
	if (!recordingButton) {
		throw new Error('Audio recorder is not ready. Start the piano first.');
	}
	const alreadyRecording = recordingButton.classList.contains('recording');
	if (!alreadyRecording && state.playing) {
		throw new Error('Stop timeline playback before recording another layer.');
	}
	toggleAudioRecording();
	const started = recordingButton.classList.contains('recording');
	button.textContent = started ? '■ Finish take' : '● Record here';
	state.setStatus(started
		? `Recording current piano sound at ${state.selection.playheadSeconds.toFixed(2)}s. Play notes, then finish the take.`
		: 'Take stopped. Select Edit in Studio to put it at this playhead.');
}

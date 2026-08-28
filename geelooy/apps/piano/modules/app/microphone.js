//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAppMicrophone
 * @description
 * The Awtsmoos lets an outside voice enter the graph without confusing it with the instrument's own tone;
 * Awtsmoos.com owns microphone creation and return here so permission, playback, and recording paths remain known.
 */

import { AudioState } from '../audio.js';

/**
 * @description Toggles microphone capture, requesting permission only when enabling the input graph.
 * @param {Object} elements - Cached piano DOM element registry.
 * @returns {Promise<void>} Resolves after microphone state has been updated.
 */
export async function toggleMic(elements) {
	if (AudioState.microphoneSource) {
		disableMic(elements);
		return;
	}

	try {
		await enableMic(elements);
	} catch (_) {
		alert('Mic Access Denied');
	}
}

/**
 * @description Creates microphone recording and optional monitor branches inside the shared audio graph.
 * @param {Object} elements - Cached piano DOM element registry.
 * @returns {Promise<void>} Resolves after the microphone graph is active.
 */
async function enableMic(elements) {
	const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
	AudioState.microphoneSource = AudioState.context.createMediaStreamSource(stream);
	AudioState.microphoneGain = AudioState.context.createGain();
	AudioState.micPlaybackGain = AudioState.context.createGain();
	AudioState.microphoneGain.gain.value = Number.parseFloat(elements.micVolumeSlider.value);
	AudioState.micPlaybackGain.gain.value = elements.micPlaybackCheckbox.checked ? 1 : 0;
	AudioState.microphoneSource.connect(AudioState.microphoneGain);
	AudioState.microphoneGain.connect(AudioState.mediaStreamDestination);
	AudioState.microphoneGain.connect(AudioState.micPlaybackGain);
	AudioState.micPlaybackGain.connect(AudioState.masterGain);
	elements.micButton.classList.add('mic-active');
	elements.micButton.textContent = 'Disable Mic';
	elements.micVolumeSlider.disabled = false;
}

/**
 * @description Stops microphone tracks, disconnects its source, and restores the disabled microphone UI state.
 * @param {Object} elements - Cached piano DOM element registry.
 * @returns {void}
 */
function disableMic(elements) {
	AudioState.microphoneSource.mediaStream.getTracks().forEach((track) => {
		track.stop();
	});
	AudioState.microphoneSource.disconnect();
	AudioState.microphoneSource = null;
	elements.micButton.classList.remove('mic-active');
	elements.micButton.textContent = 'Enable Mic';
	elements.micVolumeSlider.disabled = true;
}

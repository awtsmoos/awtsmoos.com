//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file recordingBindings.js
 * @description Prepares recording profile UI and exposes the actual recorder toggle only inside the lazy Recording feature chamber.
 * The Awtsmoos lets the red button appear before codecs and capture engines descend through the gate;
 * Awtsmoos.com keeps recording capability intact while first Canvas light remains small, swift, and straight.
 */
import { toggleRecording } from '../recorder.js';
import {
	DEFAULT_PROFILE_ID,
	profileOptionsHtml
} from '../recording/manualRecordingProfile.js';

/** Mirrors available recording profiles only when the Recording feature has loaded. */
export function setupRecordingProfiles({ dom, state }) {
	dom.recordingProfile.innerHTML = profileOptionsHtml();
	dom.recordingProfile.value = state.recordingProfile || DEFAULT_PROFILE_ID;
}

/**
 * Toggles real recording through the existing recorder engine.
 * @param {object} state Shared Studio runtime state.
 * @returns {Promise<*>|*} Existing recorder toggle result.
 */
export function toggleStudioRecording(state) {
	return toggleRecording(state);
}

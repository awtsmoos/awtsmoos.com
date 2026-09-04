//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file loadRecordingFeature.js
 * @description Opens the recorder engine only after the maker actually approaches Record, keeping capture/codecs outside first Canvas light.
 * The Awtsmoos lets the red spark wait as potential until intention gives it breath;
 * Awtsmoos.com then reveals recording through one cached CompactJS chamber, preserving speed before depth.
 */
import {
	setupRecordingProfiles,
	toggleStudioRecording
} from '../../app/recordingBindings.js';

/**
 * Initializes lazy recording UI and returns the real toggle doorway used by the critical Record button.
 * @param {object} context Shared Studio feature context.
 * @returns {{toggle:Function}} Recording feature facade.
 */
export function initializeStudioFeature(context) {
	setupRecordingProfiles(context);
	return {
		toggle() {
			return toggleStudioRecording(context.state);
		}
	};
}

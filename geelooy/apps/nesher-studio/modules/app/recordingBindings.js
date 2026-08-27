/* B"H
Recording bindings: the red button receives its own chamber.
The profile is a vessel of speed, but the creating breath is beyond codecs.
*/
import { toggleRecording } from '../recorder.js';
import { DEFAULT_PROFILE_ID, profileOptionsHtml } from '../recording/manualRecordingProfile.js';

export function setupRecordingProfiles({ dom, state }) {
  dom.recordingProfile.innerHTML = profileOptionsHtml();
  dom.recordingProfile.value = state.recordingProfile || DEFAULT_PROFILE_ID;
}

export function bindRecordingControls({ dom, state }) {
  dom.recordButton.onclick = () => toggleRecording(state);
}

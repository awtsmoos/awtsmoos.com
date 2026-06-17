/* B"H
Thin recorder facade. Real modules live in ./recording/.
*/
import { recordingState } from './recording/state.js';

export { toggleAudioRecording } from './recording/audio.js';
export { toggleVideoRecording } from './recording/video.js';
export { toggleSheetRecording } from './recording/sheet.js';
export { logVideoKeyDown, logVideoKeyUp, sendFrameStateToWorker } from './recording/videoEvents.js';
export { recordingState } from './recording/state.js';

export const isVideoRecording = { valueOf: () => recordingState.isVideoRecording };
export const isSheetRecording = { valueOf: () => recordingState.isSheetRecording };
export const sheetNotes = recordingState.sheetNotes;
export const sheetRecordingStartTime = { valueOf: () => recordingState.sheetRecordingStartTime };

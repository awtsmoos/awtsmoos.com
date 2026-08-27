/* B"H
Plain text note capture: a small scroll of names like A1 C3 F#4, nothing hidden.
*/
import { elements } from '../ui.js';
import { recordingState } from './state.js';
import { downloadBlob } from './download.js';

export function toggleTextRecording() {
    const btn = elements.recordTextButton;
    if (recordingState.isTextRecording) {
        stopTextRecording(btn);
        return;
    }
    recordingState.textNotes = [];
    recordingState.isTextRecording = true;
    if (btn) {
        btn.textContent = 'Done Text';
        btn.classList.add('recording');
    }
}

export function logTextNote(noteName) {
    if (!recordingState.isTextRecording) return;
    recordingState.textNotes.push(String(noteName).trim());
}

function stopTextRecording(btn) {
    recordingState.isTextRecording = false;
    const text = recordingState.textNotes.join(' ');
    if (btn) {
        btn.textContent = 'Record Text';
        btn.classList.remove('recording');
    }
    if (navigator.clipboard && text) navigator.clipboard.writeText(text).catch(() => {});
    downloadBlob(new Blob([text + '\n'], { type: 'text/plain' }), `BH-Notes-${Date.now()}.txt`);
}

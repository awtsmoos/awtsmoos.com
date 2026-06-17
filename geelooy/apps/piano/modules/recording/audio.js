/* B"H */
import { elements } from '../ui.js';
import { startMediaRecorder, stopMediaRecorder } from './media.js';

export function toggleAudioRecording() {
    const btn = elements.recordAudioButton;
    if (btn.classList.contains('recording')) {
        stopMediaRecorder();
        btn.textContent = 'Record 🎤';
        btn.classList.remove('recording');
    } else {
        startMediaRecorder('audio');
        btn.textContent = 'Stop';
        btn.classList.add('recording');
    }
}

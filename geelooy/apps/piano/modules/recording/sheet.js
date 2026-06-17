/* B"H */
import { AudioState } from '../audio.js';
import { elements } from '../ui.js';
import { recordingState } from './state.js';

export function toggleSheetRecording() {
    const btn = elements.recordSheetButton;
    if (recordingState.isSheetRecording) {
        recordingState.isSheetRecording = false; btn.classList.remove('recording'); btn.textContent = 'Record 🎼';
        if (recordingState.sheetNotes.length > 0) processAndRenderSheetMusic();
    } else {
        recordingState.isSheetRecording = true; recordingState.sheetNotes = []; recordingState.sheetRecordingStartTime = AudioState.context.currentTime;
        btn.classList.add('recording'); btn.textContent = 'Done 🎼';
    }
}

function processAndRenderSheetMusic() {
    if (window.renderProfessionalSheetMusic && window.quantizeNotes) {
        const quantized = window.quantizeNotes(recordingState.sheetNotes);
        const canvas = window.renderProfessionalSheetMusic(quantized, document.getElementById('sheet-music-container'));
        if (canvas) { const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = 'Awtsmoos-Sheet-Music.png'; document.body.appendChild(a); a.click(); a.remove(); }
    } else alert('Rendering engine not loaded.');
}

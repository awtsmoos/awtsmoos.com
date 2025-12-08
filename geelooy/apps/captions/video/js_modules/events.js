/* B"H */
import { DOM } from './config.js';
import { triggerRender, triggerPreview } from './actions.js';
import { updateUI, hideMobilePreview, setStatus } from './ui.js';
import { AppState } from './state.js';
import { saveSettings, savePreset, deletePreset, applyPreset } from './storage.js';
import { initWorker } from './worker_client.js';

export function attachEvents() {
    // --- Main Buttons ---
    if(DOM.renderButton) DOM.renderButton.addEventListener('click', () => triggerRender());
    if(DOM.previewButton) DOM.previewButton.addEventListener('click', () => triggerPreview(true));
    
    // --- Mobile Close ---
    if(DOM.mobileCloseBtn) DOM.mobileCloseBtn.addEventListener('click', hideMobilePreview);
    if(DOM.cancelButton) DOM.cancelButton.addEventListener('click', () => {
        initWorker(); // Hard reset
        hideMobilePreview();
    });

    // --- Inputs Auto-Save & Auto-Preview ---
    if(DOM.controlsDiv) {
        DOM.controlsDiv.addEventListener('input', (e) => {
            saveSettings(AppState);
            
            // Update Slider Text
            if(e.target.type === 'range') {
                const grp = e.target.closest('.control-group, .slider-group');
                const val = grp?.querySelector('.value-display') || grp?.querySelector('span'); // fallback
                // Only if it has an ID ending in Value usually
                const specificDisplay = document.getElementById(e.target.id + 'Value');
                if(specificDisplay) specificDisplay.textContent = e.target.value;
            }

            // Debounce Preview
            if(AppState.previewTimer) clearTimeout(AppState.previewTimer);
            AppState.previewTimer = setTimeout(() => {
                if(AppState.status === 'IDLE') triggerPreview(false);
            }, 400);
        });

        DOM.controlsDiv.addEventListener('change', () => {
            saveSettings(AppState);
            updateUI(AppState);
            if(AppState.status === 'IDLE') triggerPreview(false);
        });
    }

    // --- Directory Picker ---
    if(DOM.selectDownloadFolderButton) {
        DOM.selectDownloadFolderButton.addEventListener('click', async () => {
            if('showDirectoryPicker' in window) {
                try {
                    AppState.dirHandle = await window.showDirectoryPicker();
                    if(DOM.folderDisplay) DOM.folderDisplay.textContent = "Selected: " + AppState.dirHandle.name;
                } catch(e) { /* Cancelled */ }
            } else {
                alert("Browser not supported.");
            }
        });
    }

    // --- Presets ---
    if(DOM.savePresetBtn) DOM.savePresetBtn.addEventListener('click', () => savePreset(AppState));
    if(DOM.deletePresetBtn) DOM.deletePresetBtn.addEventListener('click', () => deletePreset(AppState));
    if(DOM.presetSelect) DOM.presetSelect.addEventListener('change', (e) => applyPreset(AppState, e.target.value));

    // --- File Readers (Cache Text) ---
    if(DOM.srtFile) DOM.srtFile.addEventListener('change', async (e) => {
        if(e.target.files[0]) AppState.srtText.main = await e.target.files[0].text();
    });
    if(DOM.translationSrtFile) DOM.translationSrtFile.addEventListener('change', async (e) => {
        if(e.target.files[0]) AppState.srtText.trans = await e.target.files[0].text();
    });
}
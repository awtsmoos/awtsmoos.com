// B"H
/**
 * Application Bootloader
 * 
 * B"H
 * Orchestrates the initial creation of the vessel (DOM) and binds the user's intent.
 */

import { initLayout, getElements, checkDivineTools, updateStatus, updateDataStatus } from './ui.js';
import { KokoroTTS } from './kokoro.js'; // B"H - Using Portable API
import { resumeAudioContext } from './visualizer.js';
import { log } from './logger.js';

const DEFAULTS = {
    standard: "B\"H\nBlessed is the Awtsmoos, the Creator of all Existence.",
    raw: "blˈɛst ɪz ði kriˈeɪtə ʌv ˈɔːl ɪɡzˈɪstəns"
};

const boot = async () => {
    initLayout();

    try {
        checkDivineTools();
        const els = getElements();
        
        // B"H - Initialize the Portable API
        const tts = new KokoroTTS();

        // Check Cache Status immediately
        const integrity = await tts.checkIntegrity();
        updateDataStatus(integrity);

        // If missing data, the button says "INITIALIZE", else "IGNITE"
        if (integrity.model && integrity.voice && integrity.tokenizer) {
             // Auto-ignite if ready
             await tts.ignite({
                 onLog: (msg, type) => {},
                 onProgress: (task, p) => {
                     if(task === 'model') import('./ui.js').then(m => m.updateLoadProgress(p));
                     if(task === 'voice') import('./ui.js').then(m => m.updateVoiceProgress(p));
                 }
             });
        }

        // --- Event Listeners ---

        els.speedSlider.addEventListener('input', (e) => {
            els.speedVal.textContent = e.target.value;
        });

        els.textInput.addEventListener('input', (e) => {
            const count = e.target.value.length;
            els.charCount.textContent = count;
            els.charCount.classList.toggle('text-red-500', count > 1000);
        });

        els.generateBtn.addEventListener('click', async () => {
            // If not ready, this button acts as the downloader/initializer
            if (!tts.isReady) {
                els.generateBtn.disabled = true;
                log("B\"H - Beginning Neural Synchronization...", "info");
                try {
                    await tts.ignite({
                        onProgress: (task, p) => {
                            if(task === 'model') import('./ui.js').then(m => m.updateLoadProgress(p));
                            if(task === 'voice') import('./ui.js').then(m => m.updateVoiceProgress(p));
                        },
                        onLog: (msg, type) => {} // already logged by api internal logger
                    });
                    
                    // Refresh status check
                    const newStatus = await tts.checkIntegrity();
                    updateDataStatus(newStatus);
                    
                } catch (e) {
                    els.generateBtn.disabled = false;
                    return; 
                }
            } else {
                // If ready, it speaks
                const text = els.textInput.value.trim();
                const speed = parseFloat(els.speedSlider.value);
                const isRaw = els.rawModeToggle.checked;
                
                if (!text) return log("Input Empty.", "warning");
                tts.speak(text, speed, isRaw);
            }
        });

        els.convertIpaBtn.addEventListener('click', () => {
             const text = els.textInput.value.trim();
             if (text && tts.isReady) tts.engine.requestPhonemes(text);
             else log("Engine not ready for phonemization.", "warning");
        });

        els.rawModeToggle.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const currentText = els.textInput.value.trim();
            
            if (isChecked) {
                if (currentText === DEFAULTS.standard || currentText.includes("Blessed is the Awtsmoos")) {
                    els.textInput.value = DEFAULTS.raw;
                }
                log("B\"H - IPA MODE ACTIVATED. Text expects phonetic symbols.");
            } else {
                if (currentText === DEFAULTS.raw) {
                    els.textInput.value = DEFAULTS.standard;
                }
                log("B\"H - STANDARD MODE ACTIVATED.");
            }
            els.charCount.textContent = els.textInput.value.length;
        });

        els.purgeBtn.addEventListener('click', async () => {
            if(confirm("B\"H - Are you sure you want to delete the cached model, voice, and tokenizer? You will need to download them again.")) {
                await tts.purgeCache();
                updateDataStatus(await tts.checkIntegrity());
                updateStatus(false);
                import('./ui.js').then(m => {
                    m.updateLoadProgress(0);
                    m.updateVoiceProgress(0);
                });
            }
        });
        
        const resumeAudio = () => {
            resumeAudioContext();
            document.removeEventListener('click', resumeAudio);
        };
        document.addEventListener('click', resumeAudio);
        
        log("B\"H - Forge UI Manifested.");
        // Character count init
        els.charCount.textContent = els.textInput.value.length;

    } catch (err) {
        log(err, "error");
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
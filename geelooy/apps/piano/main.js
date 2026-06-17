
/* B"H */
// piano/main.js
import { initAudio, AudioState } from './modules/audio.js';
import { createCustomWaves, ALL_WAVEFORMS } from './modules/waveforms.js';
import { 
    cacheElements, elements, generateKeyboard, handleKeyboardResize, 
    updateScrollbarThumbs, scrollState, setScroll 
} from './modules/ui.js';
import { setupInputListeners, noteNames, triggerNoteOn, triggerNoteOff } from './modules/input.js';
import { updateAllActiveNotesParameters } from './modules/synth.js';
import { toggleAudioRecording, toggleVideoRecording, toggleSheetRecording, toggleTextRecording } from './modules/recorder.js';
import { startAccompaniment, stopAccompaniment } from './modules/accompaniment.js';
import { initMidi } from './modules/performance/midi.js';
import { setSustainPedal } from './modules/performance/pedal.js';
import { activeNotes, stopSynth } from './modules/synth.js';
import { SOUND_PRESET_LIST, getSoundPreset, applyPresetToElements } from './modules/sound/presets.js';
import { EFFECT_MODE_LIST, getEffectMode } from './modules/effects/effectPresets.js';

document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    
    // --- POPULATE SELECTS ---
    function populateSelects() {
        if (elements.soundPresetSelect) {
            elements.soundPresetSelect.innerHTML = '';
            SOUND_PRESET_LIST.forEach(preset => {
                const opt = document.createElement('option');
                opt.value = preset.id;
                opt.textContent = preset.label;
                elements.soundPresetSelect.appendChild(opt);
            });
            elements.soundPresetSelect.value = 'awtsmoos-dream-electric';
        }
        if (elements.effectModeSelect) {
            elements.effectModeSelect.innerHTML = '';
            EFFECT_MODE_LIST.forEach(mode => {
                const opt = document.createElement('option');
                opt.value = mode.id;
                opt.textContent = mode.label;
                elements.effectModeSelect.appendChild(opt);
            });
            elements.effectModeSelect.value = 'balanced';
        }
        const selects = [elements.waveformSelect, elements.waveform2Select, elements.chordWaveformSelect, elements.bassWaveformSelect];
        selects.forEach(sel => {
            if(!sel) return;
            sel.innerHTML = '';
            ALL_WAVEFORMS.forEach(wave => {
                const opt = document.createElement('option');
                opt.value = wave;
                opt.textContent = wave.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                sel.appendChild(opt);
            });
        });
        applyPresetToElements(elements, getSoundPreset(elements.soundPresetSelect?.value));
    }

    elements.startButton.addEventListener('click', async () => {
        const success = initAudio();
        if (!success) { alert("Audio Init Failed"); return; }
        
        populateSelects();
        createCustomWaves(AudioState.context);
        
        elements.startScreen.style.display = 'none';
        elements.appContainer.style.display = 'flex';
        
        loadSettings();
        generateKeyboard(noteNames);
        setupInputListeners();
        initMidi({
            onNoteOn: (noteName, velocity, midiNote) => triggerNoteOn(noteName, `midi-${midiNote}`, { x: 0, y: 180 * velocity }),
            onNoteOff: (_noteName, midiNote) => triggerNoteOff(`midi-${midiNote}`),
            onPedal: down => setSustainPedal(down, activeNotes, stopSynth)
        }).catch(err => console.warn('MIDI init skipped', err));
        loadScrollState();
        
        // Start accompaniment loop (it checks checkbox internally)
        startAccompaniment();
    });
    
    // --- EVENT BINDING ---
    // UI Toggles
    elements.menuIcon.addEventListener('click', () => elements.settingsBar.classList.toggle('expanded'));
    elements.visualEffectsToggle.addEventListener('click', () => elements.visualEffectsMenu.classList.toggle('visible'));
    elements.advancedSynthToggle.addEventListener('click', () => elements.advancedSynthMenu.classList.toggle('visible'));
    elements.chordSettingsToggle.addEventListener('click', () => elements.chordSettingsMenu.classList.toggle('visible'));
    elements.audioIoToggle.addEventListener('click', () => elements.audioIoMenu.classList.toggle('visible'));

    // Resizing
    ['keyWidthSlider', 'octaveSelect', 'alwaysDualCheckbox', 'independentScrollCheckbox', 'desktopKeysCheckbox'].forEach(key => {
        if(elements[key]) elements[key].addEventListener('input', () => {
             handleKeyboardResize(noteNames);
             saveSettings();
        });
    });

    // Audio Controls
    elements.masterVolumeSlider.addEventListener('input', () => {
        AudioState.masterGain.gain.setTargetAtTime(parseFloat(elements.masterVolumeSlider.value), AudioState.context.currentTime, 0.01);
        saveSettings();
    });

    // Recording
    elements.recordAudioButton.addEventListener('click', toggleAudioRecording);
    elements.recordVideoButton.addEventListener('click', toggleVideoRecording);
    elements.recordSheetButton.addEventListener('click', toggleSheetRecording);
    if (elements.recordTextButton) elements.recordTextButton.addEventListener('click', toggleTextRecording);

    if (elements.soundPresetSelect) elements.soundPresetSelect.addEventListener('change', () => {
        applyPresetToElements(elements, getSoundPreset(elements.soundPresetSelect.value));
        updateAllActiveNotesParameters();
        if (AudioState.lfo) {
            AudioState.lfo.osc.frequency.setTargetAtTime(parseFloat(elements.lfoRateSlider.value), AudioState.context.currentTime, 0.01);
            AudioState.lfo.gain.gain.setTargetAtTime(parseFloat(elements.lfoDepthSlider.value), AudioState.context.currentTime, 0.01);
        }
        saveSettings();
    });

    if (elements.effectModeSelect) elements.effectModeSelect.addEventListener('change', () => {
        applyEffectModeToElements(elements.effectModeSelect.value);
        updateAllActiveNotesParameters();
        saveSettings();
    });

    // Synth Params
    const paramIds = [
        'soundPresetSelect', 'waveformSelect', 'chordWaveformSelect', 'bassWaveformSelect', 'playChordsCheckbox', 'chordModeSelect', 'chordOctaveSelect',
        'attackSlider', 'decaySlider', 'sustainSlider', 'releaseSlider',
        'waveform2Select', 'oscMixSlider', 'detuneSlider', 'pitchDepthSlider', 'pitchAttackSlider',
        'filterCutoffSlider', 'filterQSlider', 'lfoRateSlider', 'lfoDepthSlider', 'effectModeSelect', 'chorusSlider', 'delaySlider', 'delayTimeSlider', 'delayFeedbackSlider', 'saturationSlider', 'reverbSlider'
    ];
    paramIds.forEach(key => {
        if(elements[key]) elements[key].addEventListener('input', () => {
            updateAllActiveNotesParameters();
            // LFO special update?
            // Handled inside updateAllActive or separate?
            // LFO rate is global.
            if(key.includes('lfo')) {
                AudioState.lfo.osc.frequency.setTargetAtTime(parseFloat(elements.lfoRateSlider.value), AudioState.context.currentTime, 0.01);
                AudioState.lfo.gain.gain.setTargetAtTime(parseFloat(elements.lfoDepthSlider.value), AudioState.context.currentTime, 0.01);
            }
            saveSettings();
        });
    });
    
    // Mic
    elements.micButton.addEventListener('click', toggleMic);
    
    elements.restoreDefaultsButton.addEventListener('click', restoreDefaults);
});


function applyEffectModeToElements(modeId) {
    const mode = getEffectMode(modeId);
    if (elements.chorusSlider) elements.chorusSlider.value = mode.chorusSend;
    if (elements.delaySlider) elements.delaySlider.value = mode.delaySend;
    if (elements.delayTimeSlider) elements.delayTimeSlider.value = mode.delayTime;
    if (elements.delayFeedbackSlider) elements.delayFeedbackSlider.value = mode.delayFeedback;
    if (elements.saturationSlider) elements.saturationSlider.value = mode.saturationDrive;
    if (elements.reverbSlider) elements.reverbSlider.value = mode.reverbSend;
}

async function toggleMic() {
    if (AudioState.microphoneSource) {
        AudioState.microphoneSource.mediaStream.getTracks().forEach(t => t.stop());
        AudioState.microphoneSource.disconnect();
        AudioState.microphoneSource = null;
        elements.micButton.classList.remove('mic-active');
        elements.micButton.textContent = 'Enable Mic';
        elements.micVolumeSlider.disabled = true;
    } else {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            AudioState.microphoneSource = AudioState.context.createMediaStreamSource(stream);
            AudioState.microphoneGain = AudioState.context.createGain();
            AudioState.micPlaybackGain = AudioState.context.createGain();
            
            AudioState.microphoneGain.gain.value = parseFloat(elements.micVolumeSlider.value);
            AudioState.micPlaybackGain.gain.value = elements.micPlaybackCheckbox.checked ? 1.0 : 0.0;
            
            AudioState.microphoneSource.connect(AudioState.microphoneGain);
            AudioState.microphoneGain.connect(AudioState.mediaStreamDestination);
            AudioState.microphoneGain.connect(AudioState.micPlaybackGain);
            AudioState.micPlaybackGain.connect(AudioState.masterGain);
            
            elements.micButton.classList.add('mic-active');
            elements.micButton.textContent = 'Disable Mic';
            elements.micVolumeSlider.disabled = false;
        } catch(e) {
            alert("Mic Access Denied");
        }
    }
}

// Persistence
function saveSettings() {
    const s = {};
    Object.keys(elements).forEach(k => {
        const el = elements[k];
        if (el && (el.type === 'checkbox' || el.tagName === 'SELECT' || el.type === 'range')) {
            s[k] = el.type === 'checkbox' ? el.checked : el.value;
        }
    });
    localStorage.setItem('pianoSettings', JSON.stringify(s));
}

function loadSettings() {
    const s = JSON.parse(localStorage.getItem('pianoSettings'));
    if (s) {
        Object.keys(s).forEach(k => {
            if (elements[k]) {
                if (elements[k].type === 'checkbox') elements[k].checked = s[k];
                else elements[k].value = s[k];
            }
        });
    }
}

function loadScrollState() {
    const s = JSON.parse(localStorage.getItem('pianoScrollState'));
    if (s) {
        scrollState.x = s.x || 0;
        scrollState.x2 = s.x2;
        setScroll(scrollState.x, 0);
        if(scrollState.x2) setScroll(scrollState.x2, 1);
        updateScrollbarThumbs();
    }
}

function restoreDefaults() {
    localStorage.removeItem('pianoSettings');
    location.reload();
}



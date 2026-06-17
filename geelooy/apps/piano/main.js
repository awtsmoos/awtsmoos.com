/* B"H */
// piano/main.js
import { initAudio, AudioState } from './modules/audio.js';
import { createCustomWaves, ALL_WAVEFORMS } from './modules/waveforms.js';
import { cacheElements, elements, generateKeyboard, handleKeyboardResize, updateScrollbarThumbs, scrollState, setScroll } from './modules/ui.js';
import { setupInputListeners, noteNames, triggerNoteOn, triggerNoteOff } from './modules/input.js';
import { updateAllActiveNotesParameters, activeNotes, stopSynth } from './modules/synth.js';
import { toggleAudioRecording, toggleVideoRecording, toggleSheetRecording, toggleTextRecording } from './modules/recorder.js';
import { startAccompaniment } from './modules/accompaniment.js';
import { initMidi } from './modules/performance/midi.js';
import { setSustainPedal } from './modules/performance/pedal.js';
import { SOUND_PRESET_LIST, getSoundPreset, applyPresetToElements } from './modules/sound/presets.js';
import { EFFECT_MODE_LIST, getEffectMode } from './modules/effects/effectPresets.js';

const DEFAULT_PRESET_ID = 'awtsmoos-dream-electric';
const DEFAULT_START_OCTAVE = '0';
const DEFAULT_VIEW_OCTAVE = 3;

function populateSelects() {
    fillSelect(elements.soundPresetSelect, SOUND_PRESET_LIST, 'id', 'label');
    fillSelect(elements.effectModeSelect, EFFECT_MODE_LIST, 'id', 'label');
    [elements.waveformSelect, elements.waveform2Select, elements.chordWaveformSelect, elements.bassWaveformSelect]
        .forEach(sel => fillWaveSelect(sel));
    if (elements.soundPresetSelect) elements.soundPresetSelect.value = DEFAULT_PRESET_ID;
    applyPresetToElements(elements, getSoundPreset(elements.soundPresetSelect?.value));
    if (elements.octaveSelect) elements.octaveSelect.value = DEFAULT_START_OCTAVE;
}

function fillSelect(select, items, valueKey, labelKey) {
    if (!select) return;
    select.innerHTML = '';
    items.forEach(item => select.append(new Option(item[labelKey], item[valueKey])));
}

function fillWaveSelect(select) {
    if (!select) return;
    select.innerHTML = '';
    ALL_WAVEFORMS.forEach(wave => select.append(new Option(formatWaveName(wave), wave)));
}

function formatWaveName(wave) { return wave.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    bindChromeToggles();
    bindRecordingButtons();
    bindControlEvents();
    elements.startButton.addEventListener('click', startApp);
    elements.restoreDefaultsButton.addEventListener('click', restoreDefaults);
});

async function startApp() {
    if (!initAudio()) { alert('Audio Init Failed'); return; }
    populateSelects();
    createCustomWaves(AudioState.context);
    elements.startScreen.style.display = 'none';
    elements.appContainer.style.display = 'flex';
    loadSettings();
    if (elements.soundPresetSelect?.value === DEFAULT_PRESET_ID) applyPresetToElements(elements, getSoundPreset(DEFAULT_PRESET_ID));
    generateKeyboard(noteNames);
    setupInputListeners();
    initMidi({
        onNoteOn: (noteName, velocity, midiNote) => triggerNoteOn(noteName, `midi-${midiNote}`, { x: 0, y: 180 * velocity }),
        onNoteOff: (_noteName, midiNote) => triggerNoteOff(`midi-${midiNote}`),
        onPedal: down => setSustainPedal(down, activeNotes, stopSynth)
    }).catch(err => console.warn('MIDI init skipped', err));
    loadScrollState();
    startAccompaniment();
}

function bindChromeToggles() {
    elements.menuIcon.addEventListener('click', () => elements.settingsBar.classList.toggle('expanded'));
    elements.visualEffectsToggle.addEventListener('click', () => elements.visualEffectsMenu.classList.toggle('visible'));
    elements.advancedSynthToggle.addEventListener('click', () => elements.advancedSynthMenu.classList.toggle('visible'));
    elements.chordSettingsToggle.addEventListener('click', () => elements.chordSettingsMenu.classList.toggle('visible'));
    elements.audioIoToggle.addEventListener('click', () => elements.audioIoMenu.classList.toggle('visible'));
}

function bindRecordingButtons() {
    elements.recordAudioButton.addEventListener('click', toggleAudioRecording);
    elements.recordVideoButton.addEventListener('click', toggleVideoRecording);
    elements.recordSheetButton.addEventListener('click', toggleSheetRecording);
    if (elements.recordTextButton) elements.recordTextButton.addEventListener('click', toggleTextRecording);
}

function bindControlEvents() {
    ['keyWidthSlider', 'octaveSelect', 'alwaysDualCheckbox', 'independentScrollCheckbox', 'desktopKeysCheckbox'].forEach(key => {
        if (elements[key]) elements[key].addEventListener('input', () => { handleKeyboardResize(noteNames); saveSettings(); });
    });
    elements.masterVolumeSlider.addEventListener('input', () => {
        AudioState.masterGain.gain.setTargetAtTime(parseFloat(elements.masterVolumeSlider.value), AudioState.context.currentTime, 0.01);
        saveSettings();
    });
    bindPresetControls();
    bindSynthControls();
    elements.micButton.addEventListener('click', toggleMic);
}

function bindPresetControls() {
    elements.soundPresetSelect?.addEventListener('change', () => {
        applyPresetToElements(elements, getSoundPreset(elements.soundPresetSelect.value));
        refreshActiveSound();
    });
    elements.effectModeSelect?.addEventListener('change', () => {
        applyEffectModeToElements(elements.effectModeSelect.value);
        refreshActiveSound();
    });
}

function bindSynthControls() {
    const ids = ['waveformSelect', 'waveform2Select', 'chordWaveformSelect', 'bassWaveformSelect', 'playChordsCheckbox', 'chordModeSelect', 'chordOctaveSelect', 'attackSlider', 'decaySlider', 'sustainSlider', 'releaseSlider', 'oscMixSlider', 'detuneSlider', 'pitchDepthSlider', 'pitchAttackSlider', 'filterCutoffSlider', 'filterQSlider', 'lfoRateSlider', 'lfoDepthSlider', 'chorusSlider', 'delaySlider', 'delayTimeSlider', 'delayFeedbackSlider', 'saturationSlider', 'reverbSlider'];
    ids.forEach(key => elements[key]?.addEventListener('input', () => refreshActiveSound(key)));
}

function refreshActiveSound(key = '') {
    updateAllActiveNotesParameters();
    if (key.includes('lfo') && AudioState.lfo) {
        AudioState.lfo.osc.frequency.setTargetAtTime(parseFloat(elements.lfoRateSlider.value), AudioState.context.currentTime, 0.01);
        AudioState.lfo.gain.gain.setTargetAtTime(parseFloat(elements.lfoDepthSlider.value), AudioState.context.currentTime, 0.01);
    }
    saveSettings();
}

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
    if (AudioState.microphoneSource) return disableMic();
    try { await enableMic(); } catch (_) { alert('Mic Access Denied'); }
}

async function enableMic() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    AudioState.microphoneSource = AudioState.context.createMediaStreamSource(stream);
    AudioState.microphoneGain = AudioState.context.createGain();
    AudioState.micPlaybackGain = AudioState.context.createGain();
    AudioState.microphoneGain.gain.value = parseFloat(elements.micVolumeSlider.value);
    AudioState.micPlaybackGain.gain.value = elements.micPlaybackCheckbox.checked ? 1 : 0;
    AudioState.microphoneSource.connect(AudioState.microphoneGain);
    AudioState.microphoneGain.connect(AudioState.mediaStreamDestination);
    AudioState.microphoneGain.connect(AudioState.micPlaybackGain);
    AudioState.micPlaybackGain.connect(AudioState.masterGain);
    elements.micButton.classList.add('mic-active');
    elements.micButton.textContent = 'Disable Mic';
    elements.micVolumeSlider.disabled = false;
}

function disableMic() {
    AudioState.microphoneSource.mediaStream.getTracks().forEach(t => t.stop());
    AudioState.microphoneSource.disconnect();
    AudioState.microphoneSource = null;
    elements.micButton.classList.remove('mic-active');
    elements.micButton.textContent = 'Enable Mic';
    elements.micVolumeSlider.disabled = true;
}

function saveSettings() {
    const saved = {};
    Object.keys(elements).forEach(k => {
        const el = elements[k];
        if (el && (el.type === 'checkbox' || el.tagName === 'SELECT' || el.type === 'range')) saved[k] = el.type === 'checkbox' ? el.checked : el.value;
    });
    localStorage.setItem('pianoSettings', JSON.stringify(saved));
}

function loadSettings() {
    const saved = JSON.parse(localStorage.getItem('pianoSettings'));
    if (!saved) return;
    Object.keys(saved).forEach(k => {
        if (!elements[k]) return;
        if (elements[k].type === 'checkbox') elements[k].checked = saved[k];
        else elements[k].value = saved[k];
    });
}

function loadScrollState() {
    const saved = JSON.parse(localStorage.getItem('pianoScrollState'));
    if (saved) {
        scrollState.x = saved.x || 0;
        scrollState.x2 = saved.x2 || 0;
        setScroll(scrollState.x, 0);
        if (scrollState.x2) setScroll(scrollState.x2, 1);
    } else setDefaultThirdOctaveScroll();
    updateScrollbarThumbs();
}

function setDefaultThirdOctaveScroll() {
    const width = parseInt(elements.keyWidthSlider.value || '130', 10);
    const c3Scroll = width * 7 * DEFAULT_VIEW_OCTAVE;
    setScroll(c3Scroll, 0);
    if (elements.independentScrollCheckbox?.checked) setScroll(0, 1);
}

function restoreDefaults() {
    localStorage.removeItem('pianoSettings');
    localStorage.removeItem('pianoScrollState');
    location.reload();
}

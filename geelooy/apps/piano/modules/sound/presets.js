/* B"H
Presets are masks of one light: Rhodes rain, DX glass, Wurli bark, synth sea.
*/

import { getEffectMode } from '../effects/effectPresets.js';

export const SOUND_PRESETS = {
    'awtsmoos-dream-electric': {
        id: 'awtsmoos-dream-electric', label: 'Awtsmoos Dream Electric', wave1: 'wet-electric-keys', wave2: 'shimmer-sine', chordWave: 'wet-electric-keys', bassWave: 'hard-bass',
        attack: 0.018, decay: 0.34, sustain: 0.58, release: 0.92, oscMix: 0.46, detuneCents: 9, pitchDepth: 18, pitchAttack: 0.005,
        filterCutoff: 6400, filterQ: 9.5, lfoRate: 3.6, lfoDepth: 820, fmRatio: 2, fmIndex: 0.82, fmTone: 'glass', stereoSpread: 0.62, driftCents: 4,
        transientGain: 0.12, transientMs: 16, saturationDrive: 1.7, effectMode: 'wet', chorusSend: 0.36, delaySend: 0.12, delayTime: 0.31, delayFeedback: 0.22, reverbSend: 0.68
    },
    'dx-glass-ep': {
        id: 'dx-glass-ep', label: 'DX Glass EP', wave1: 'sine', wave2: 'shimmer-sine', chordWave: 'shimmer-sine', bassWave: 'sub-osc',
        attack: 0.012, decay: 0.42, sustain: 0.48, release: 1.08, oscMix: 0.34, detuneCents: 4, pitchDepth: 11, pitchAttack: 0.004,
        filterCutoff: 9200, filterQ: 4.2, lfoRate: 2.8, lfoDepth: 360, fmRatio: 3, fmIndex: 1.35, fmTone: 'bright', stereoSpread: 0.48, driftCents: 2.2,
        transientGain: 0.16, transientMs: 11, saturationDrive: 1.28, effectMode: 'balanced', chorusSend: 0.42, delaySend: 0.08, delayTime: 0.24, delayFeedback: 0.16, reverbSend: 0.58
    },
    'warm-rhodes-cloud': {
        id: 'warm-rhodes-cloud', label: 'Warm Rhodes Cloud', wave1: 'bell-ep', wave2: 'wet-electric-keys', chordWave: 'bell-ep', bassWave: 'tonewheel',
        attack: 0.024, decay: 0.5, sustain: 0.62, release: 1.2, oscMix: 0.28, detuneCents: 6, pitchDepth: 8, pitchAttack: 0.006,
        filterCutoff: 5200, filterQ: 7.2, lfoRate: 1.6, lfoDepth: 240, fmRatio: 2, fmIndex: 0.52, fmTone: 'warm', stereoSpread: 0.72, driftCents: 5,
        transientGain: 0.08, transientMs: 19, saturationDrive: 2.0, effectMode: 'space', chorusSend: 0.5, delaySend: 0.1, delayTime: 0.36, delayFeedback: 0.26, reverbSend: 0.72
    },
    'wurli-bark': {
        id: 'wurli-bark', label: 'Wurli Bark', wave1: 'growl', wave2: 'bell-ep', chordWave: 'wet-electric-keys', bassWave: 'hard-bass',
        attack: 0.01, decay: 0.22, sustain: 0.54, release: 0.54, oscMix: 0.22, detuneCents: 3, pitchDepth: 16, pitchAttack: 0.003,
        filterCutoff: 7600, filterQ: 11, lfoRate: 4.2, lfoDepth: 180, fmRatio: 2, fmIndex: 0.66, fmTone: 'bark', stereoSpread: 0.38, driftCents: 3,
        transientGain: 0.2, transientMs: 9, saturationDrive: 2.45, effectMode: 'punch', chorusSend: 0.18, delaySend: 0.04, delayTime: 0.18, delayFeedback: 0.12, reverbSend: 0.34
    },
    'cinematic-synth-keys': {
        id: 'cinematic-synth-keys', label: 'Cinematic Synth Keys', wave1: 'hyper-saw', wave2: 'shimmer-sine', chordWave: 'crystalline', bassWave: 'sub-osc',
        attack: 0.08, decay: 0.66, sustain: 0.7, release: 1.55, oscMix: 0.52, detuneCents: 15, pitchDepth: 24, pitchAttack: 0.018,
        filterCutoff: 6800, filterQ: 6, lfoRate: 0.9, lfoDepth: 620, fmRatio: 1.5, fmIndex: 0.38, fmTone: 'pad', stereoSpread: 0.9, driftCents: 7,
        transientGain: 0.04, transientMs: 24, saturationDrive: 1.55, effectMode: 'space', chorusSend: 0.62, delaySend: 0.18, delayTime: 0.42, delayFeedback: 0.34, reverbSend: 0.82
    }
};

export const PREMIUM_PRESET = SOUND_PRESETS['awtsmoos-dream-electric'];
export const SOUND_PRESET_LIST = Object.values(SOUND_PRESETS);

export function getSoundPreset(id) { return SOUND_PRESETS[id] || PREMIUM_PRESET; }

export function readPresetFromElements(elements) {
    const base = getSoundPreset(elements.soundPresetSelect?.value);
    const mode = getEffectMode(elements.effectModeSelect?.value || base.effectMode);
    return {
        ...base,
        ...mode,
        wave1: elements.waveformSelect?.value || base.wave1,
        wave2: elements.waveform2Select?.value || base.wave2,
        chordWave: elements.chordWaveformSelect?.value || base.chordWave,
        oscMix: parseFloat(elements.oscMixSlider?.value || base.oscMix),
        detuneCents: parseFloat(elements.detuneSlider?.value || base.detuneCents),
        filterCutoff: parseFloat(elements.filterCutoffSlider?.value || base.filterCutoff),
        filterQ: parseFloat(elements.filterQSlider?.value || base.filterQ),
        chorusSend: parseFloat(elements.chorusSlider?.value || mode.chorusSend),
        delaySend: parseFloat(elements.delaySlider?.value || mode.delaySend),
        delayTime: parseFloat(elements.delayTimeSlider?.value || mode.delayTime),
        delayFeedback: parseFloat(elements.delayFeedbackSlider?.value || mode.delayFeedback),
        saturationDrive: parseFloat(elements.saturationSlider?.value || mode.saturationDrive),
        reverbSend: parseFloat(elements.reverbSlider?.value || mode.reverbSend)
    };
}

export function applyPresetToElements(elements, preset) {
    set(elements.waveformSelect, preset.wave1); set(elements.waveform2Select, preset.wave2); set(elements.chordWaveformSelect, preset.chordWave); set(elements.bassWaveformSelect, preset.bassWave);
    set(elements.attackSlider, preset.attack); set(elements.decaySlider, preset.decay); set(elements.sustainSlider, preset.sustain); set(elements.releaseSlider, preset.release);
    set(elements.oscMixSlider, preset.oscMix); set(elements.detuneSlider, preset.detuneCents); set(elements.pitchDepthSlider, preset.pitchDepth); set(elements.pitchAttackSlider, preset.pitchAttack);
    set(elements.filterCutoffSlider, preset.filterCutoff); set(elements.filterQSlider, preset.filterQ); set(elements.lfoRateSlider, preset.lfoRate); set(elements.lfoDepthSlider, preset.lfoDepth);
    const mode = getEffectMode(preset.effectMode); set(elements.effectModeSelect, mode.id); set(elements.chorusSlider, preset.chorusSend ?? mode.chorusSend); set(elements.delaySlider, preset.delaySend ?? mode.delaySend); set(elements.delayTimeSlider, preset.delayTime ?? mode.delayTime); set(elements.delayFeedbackSlider, preset.delayFeedback ?? mode.delayFeedback); set(elements.saturationSlider, preset.saturationDrive ?? mode.saturationDrive); set(elements.reverbSlider, preset.reverbSend ?? mode.reverbSend);
}

function set(el, value) { if (el && value !== undefined) el.value = String(value); }

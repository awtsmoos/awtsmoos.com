/* B"H
Ameobea's Web Synth revealed the map: FM matrices, wavetable metals, filters, folding, crush, delays, modular weather.
Now the default dream is no longer a bell that rings in the skull; it is velvet light under the fingers.
The Awtsmoos breathes through the circuit: less glass, more wood, less spike, more river.
*/

import { getEffectMode } from '../effects/effectPresets.js';

const BASE = {
    wave1: 'wet-electric-keys', wave2: 'bell-ep', chordWave: 'wet-electric-keys', bassWave: 'tonewheel',
    attack: 0.028, decay: 0.48, sustain: 0.64, release: 1.38, oscMix: 0.24, detuneCents: 4,
    pitchDepth: 5, pitchAttack: 0.012, filterCutoff: 4700, filterQ: 3.2, lfoRate: 1.15, lfoDepth: 115,
    fmRatio: 1.5, fmIndex: 0.22, fmTone: 'warm', stereoSpread: 0.68, driftCents: 2.4,
    transientGain: 0.045, transientMs: 30, saturationDrive: 1.42, effectMode: 'balanced', chorusSend: 0.3,
    delaySend: 0.045, delayTime: 0.28, delayFeedback: 0.12, reverbSend: 0.44
};

const rows = [
    ['awtsmoos-dream-electric','Awtsmoos Dream Electric',{}],
    ['websynth-8op-fm-glass','WebSynth 8-Op FM Glass',{wave1:'sine',wave2:'crystalline',chordWave:'shimmer-sine',bassWave:'sub-osc',attack:.006,decay:.58,sustain:.42,release:1.28,oscMix:.62,detuneCents:3,pitchDepth:9,filterCutoff:11200,filterQ:3.4,lfoRate:2.1,lfoDepth:180,fmRatio:4,fmIndex:1.9,fmTone:'bright',transientGain:.2,transientMs:8,saturationDrive:1.18,effectMode:'balanced',chorusSend:.34,delaySend:.09,reverbSend:.52}],
    ['websynth-operator-bells','WebSynth Operator Bells',{wave1:'bell-ep',wave2:'metal-hit',chordWave:'crystalline',bassWave:'tonewheel',attack:.004,decay:.78,sustain:.22,release:1.55,oscMix:.48,detuneCents:5,pitchDepth:22,filterCutoff:9800,filterQ:5.4,lfoDepth:90,fmRatio:3.5,fmIndex:1.65,fmTone:'glass',transientGain:.28,transientMs:7,saturationDrive:1.24,effectMode:'space',chorusSend:.28,delaySend:.16,reverbSend:.76}],
    ['wavetable-morph-pad','Wavetable Morph Pad',{wave1:'soft-pad',wave2:'hyper-saw',chordWave:'angel',bassWave:'sub-osc',attack:.42,decay:1.05,sustain:.82,release:2.8,oscMix:.5,detuneCents:18,pitchDepth:4,filterCutoff:4200,filterQ:4.8,lfoRate:.38,lfoDepth:920,fmRatio:1.5,fmIndex:.24,fmTone:'pad',stereoSpread:.96,driftCents:9,transientGain:.02,saturationDrive:1.22,effectMode:'space',chorusSend:.74,delaySend:.18,reverbSend:.88}],
    ['waveedit-glass-table','WaveEdit Glass Table',{wave1:'crystalline',wave2:'shimmer-sine',chordWave:'angel',bassWave:'sub-osc',attack:.03,decay:.7,sustain:.5,release:1.9,oscMix:.44,detuneCents:7,pitchDepth:15,filterCutoff:12200,filterQ:7,lfoRate:1.2,lfoDepth:420,fmRatio:5,fmIndex:1.05,transientGain:.12,saturationDrive:1.12,effectMode:'wet',chorusSend:.5,delaySend:.12,reverbSend:.7}],
    ['bitcrush-chip-lab','Bitcrush Chip Lab',{wave1:'8-bit',wave2:'chiptune',chordWave:'8-bit',bassWave:'sub-osc',attack:.002,decay:.12,sustain:.58,release:.22,oscMix:.34,detuneCents:0,pitchDepth:0,filterCutoff:5200,filterQ:13,lfoRate:6.2,lfoDepth:140,fmRatio:2,fmIndex:.25,fmTone:'crush',transientGain:.34,transientMs:5,saturationDrive:3.1,effectMode:'punch',chorusSend:.02,delaySend:.05,reverbSend:.13}],
    ['wavefolder-brass','Wavefolder Brass Stack',{wave1:'brass-ensemble',wave2:'growl',chordWave:'fifths-saw',bassWave:'hard-bass',attack:.018,decay:.32,sustain:.72,release:.62,oscMix:.28,detuneCents:12,pitchDepth:20,filterCutoff:7200,filterQ:12,lfoRate:4.8,lfoDepth:260,fmRatio:2,fmIndex:.72,fmTone:'fold',transientGain:.18,saturationDrive:3.35,effectMode:'punch',chorusSend:.16,delaySend:.04,reverbSend:.28}],
    ['ott-hyper-pad','OTT Hyper Pad',{wave1:'hyper-saw',wave2:'soft-pad',chordWave:'hyper-saw',bassWave:'reese-bass',attack:.12,decay:.48,sustain:.86,release:1.7,oscMix:.54,detuneCents:22,pitchDepth:8,filterCutoff:8800,filterQ:6,lfoRate:.72,lfoDepth:520,fmRatio:1,fmIndex:.18,stereoSpread:.94,driftCents:8,saturationDrive:2.15,effectMode:'space',chorusSend:.68,delaySend:.2,reverbSend:.74}],
    ['granular-clouds','Granular Clouds',{wave1:'drops',wave2:'angel',chordWave:'soft-pad',bassWave:'sub-osc',attack:.18,decay:.9,sustain:.68,release:2.4,oscMix:.58,detuneCents:14,pitchDepth:28,filterCutoff:6100,filterQ:8,lfoRate:1.8,lfoDepth:1100,fmRatio:2.25,fmIndex:.52,transientGain:.04,saturationDrive:1.3,effectMode:'space',chorusSend:.72,delaySend:.24,delayTime:.46,delayFeedback:.38,reverbSend:.9}],
    ['modular-random-keys','Modular Random Keys',{wave1:'wobble',wave2:'crystalline',chordWave:'vox',bassWave:'tonewheel',attack:.02,decay:.36,sustain:.5,release:1.15,oscMix:.47,detuneCents:9,pitchDepth:30,filterCutoff:5900,filterQ:14,lfoRate:5.6,lfoDepth:760,fmRatio:2.8,fmIndex:.92,transientGain:.11,saturationDrive:1.8,effectMode:'retro',chorusSend:.44,delaySend:.17,reverbSend:.48}],
    ['fm-bass-matrix','FM Bass Matrix',{wave1:'super-fm',wave2:'neuro-bass',chordWave:'growl-bass',bassWave:'neuro-bass',attack:.004,decay:.18,sustain:.68,release:.36,oscMix:.38,detuneCents:5,pitchDepth:12,filterCutoff:2400,filterQ:16,lfoRate:3.4,lfoDepth:320,fmRatio:1.5,fmIndex:1.45,fmTone:'bass',transientGain:.22,saturationDrive:3.8,effectMode:'punch',chorusSend:.04,delaySend:0,reverbSend:.12}],
    ['reese-warp','Reese Warp',{wave1:'reese-bass',wave2:'digital-hoover',chordWave:'reese-bass',bassWave:'reese-bass',attack:.03,decay:.28,sustain:.8,release:.8,oscMix:.5,detuneCents:24,pitchDepth:6,filterCutoff:3000,filterQ:10,lfoRate:1.1,lfoDepth:740,fmRatio:1,fmIndex:.2,stereoSpread:.88,saturationDrive:2.9,effectMode:'retro',chorusSend:.42,delaySend:.04,reverbSend:.2}],
    ['acid-filter-lab','Acid Filter Lab',{wave1:'acid-pulse',wave2:'sawtooth',chordWave:'acid-pulse',bassWave:'hardstyle',attack:.002,decay:.16,sustain:.5,release:.25,oscMix:.2,detuneCents:4,pitchDepth:24,filterCutoff:1900,filterQ:22,lfoRate:7.2,lfoDepth:1450,fmRatio:2,fmIndex:.38,transientGain:.26,saturationDrive:4.1,effectMode:'punch',chorusSend:.03,delaySend:.06,reverbSend:.18}],
    ['dx-glass-ep','DX Glass EP',{wave1:'sine',wave2:'shimmer-sine',chordWave:'shimmer-sine',bassWave:'sub-osc',attack:.012,decay:.42,sustain:.48,release:1.08,oscMix:.34,detuneCents:4,pitchDepth:11,filterCutoff:9200,filterQ:4.2,lfoRate:2.8,lfoDepth:360,fmRatio:3,fmIndex:1.35,fmTone:'bright',transientGain:.16,saturationDrive:1.28,effectMode:'balanced',chorusSend:.42,delaySend:.08,reverbSend:.58}],
    ['warm-rhodes-cloud','Warm Rhodes Cloud',{wave1:'bell-ep',wave2:'wet-electric-keys',chordWave:'bell-ep',bassWave:'tonewheel',attack:.024,decay:.5,sustain:.62,release:1.2,oscMix:.28,detuneCents:6,pitchDepth:8,filterCutoff:5200,filterQ:7.2,lfoRate:1.6,lfoDepth:240,fmRatio:2,fmIndex:.52,fmTone:'warm',transientGain:.08,saturationDrive:2,effectMode:'space',chorusSend:.5,delaySend:.1,reverbSend:.72}],
    ['wurli-bark','Wurli Bark',{wave1:'growl',wave2:'bell-ep',chordWave:'wet-electric-keys',bassWave:'hard-bass',attack:.01,decay:.22,sustain:.54,release:.54,oscMix:.22,detuneCents:3,pitchDepth:16,filterCutoff:7600,filterQ:11,lfoRate:4.2,lfoDepth:180,fmRatio:2,fmIndex:.66,fmTone:'bark',transientGain:.2,saturationDrive:2.45,effectMode:'punch',chorusSend:.18,delaySend:.04,reverbSend:.34}],
    ['cinematic-synth-keys','Cinematic Synth Keys',{wave1:'hyper-saw',wave2:'shimmer-sine',chordWave:'crystalline',bassWave:'sub-osc',attack:.08,decay:.66,sustain:.7,release:1.55,oscMix:.52,detuneCents:15,pitchDepth:24,filterCutoff:6800,filterQ:6,lfoRate:.9,lfoDepth:620,fmRatio:1.5,fmIndex:.38,fmTone:'pad',transientGain:.04,saturationDrive:1.55,effectMode:'space',chorusSend:.62,delaySend:.18,reverbSend:.82}],
    ['vocal-formant-choir','Vocal Formant Choir',{wave1:'vox',wave2:'angel',chordWave:'vox',bassWave:'tonewheel',attack:.09,decay:.44,sustain:.76,release:1.8,oscMix:.45,detuneCents:11,pitchDepth:10,filterCutoff:3600,filterQ:18,lfoRate:2.4,lfoDepth:420,fmRatio:2,fmIndex:.34,transientGain:.03,saturationDrive:1.42,effectMode:'space',chorusSend:.6,delaySend:.12,reverbSend:.84}],
    ['physical-pluck-lab','Physical Pluck Lab',{wave1:'pluck',wave2:'koto',chordWave:'steel-drum',bassWave:'sub-osc',attack:.003,decay:.22,sustain:.28,release:.9,oscMix:.42,detuneCents:5,pitchDepth:18,filterCutoff:8200,filterQ:9,lfoRate:2,lfoDepth:100,fmRatio:2.7,fmIndex:.72,transientGain:.32,transientMs:6,saturationDrive:1.6,effectMode:'wet',chorusSend:.2,delaySend:.18,reverbSend:.56}],
    ['hoover-rave-cloud','Hoover Rave Cloud',{wave1:'digital-hoover',wave2:'trance-gate',chordWave:'fifths-saw',bassWave:'hardstyle',attack:.04,decay:.26,sustain:.8,release:1.1,oscMix:.55,detuneCents:28,pitchDepth:35,filterCutoff:7600,filterQ:8,lfoRate:3.8,lfoDepth:650,fmRatio:1,fmIndex:.25,stereoSpread:.9,saturationDrive:2.7,effectMode:'retro',chorusSend:.58,delaySend:.2,reverbSend:.48}]
];

export const SOUND_PRESETS = Object.fromEntries(rows.map(([id, label, patch]) => [id, { ...BASE, ...patch, id, label }]));
export const PREMIUM_PRESET = SOUND_PRESETS['awtsmoos-dream-electric'];
export const SOUND_PRESET_LIST = Object.values(SOUND_PRESETS);
export function getSoundPreset(id) { return SOUND_PRESETS[id] || PREMIUM_PRESET; }

export function readPresetFromElements(elements) {
    const base = getSoundPreset(elements.soundPresetSelect?.value);
    const mode = getEffectMode(elements.effectModeSelect?.value || base.effectMode);
    return { ...base, ...mode,
        wave1: elements.waveformSelect?.value || base.wave1, wave2: elements.waveform2Select?.value || base.wave2,
        chordWave: elements.chordWaveformSelect?.value || base.chordWave, bassWave: elements.bassWaveformSelect?.value || base.bassWave,
        oscMix: num(elements.oscMixSlider, base.oscMix), detuneCents: num(elements.detuneSlider, base.detuneCents),
        filterCutoff: num(elements.filterCutoffSlider, base.filterCutoff), filterQ: num(elements.filterQSlider, base.filterQ),
        chorusSend: num(elements.chorusSlider, mode.chorusSend), delaySend: num(elements.delaySlider, mode.delaySend),
        delayTime: num(elements.delayTimeSlider, mode.delayTime), delayFeedback: num(elements.delayFeedbackSlider, mode.delayFeedback),
        saturationDrive: num(elements.saturationSlider, mode.saturationDrive), reverbSend: num(elements.reverbSlider, mode.reverbSend) };
}

export function applyPresetToElements(elements, preset) {
    set(elements.waveformSelect, preset.wave1); set(elements.waveform2Select, preset.wave2); set(elements.chordWaveformSelect, preset.chordWave); set(elements.bassWaveformSelect, preset.bassWave);
    set(elements.attackSlider, preset.attack); set(elements.decaySlider, preset.decay); set(elements.sustainSlider, preset.sustain); set(elements.releaseSlider, preset.release);
    set(elements.oscMixSlider, preset.oscMix); set(elements.detuneSlider, preset.detuneCents); set(elements.pitchDepthSlider, preset.pitchDepth); set(elements.pitchAttackSlider, preset.pitchAttack);
    set(elements.filterCutoffSlider, preset.filterCutoff); set(elements.filterQSlider, preset.filterQ); set(elements.lfoRateSlider, preset.lfoRate); set(elements.lfoDepthSlider, preset.lfoDepth);
    const mode = getEffectMode(preset.effectMode); set(elements.effectModeSelect, mode.id); set(elements.chorusSlider, preset.chorusSend ?? mode.chorusSend); set(elements.delaySlider, preset.delaySend ?? mode.delaySend); set(elements.delayTimeSlider, preset.delayTime ?? mode.delayTime); set(elements.delayFeedbackSlider, preset.delayFeedback ?? mode.delayFeedback); set(elements.saturationSlider, preset.saturationDrive ?? mode.saturationDrive); set(elements.reverbSlider, preset.reverbSend ?? mode.reverbSend);
}

function num(el, fallback) { return parseFloat(el?.value || fallback); }
function set(el, value) { if (el && value !== undefined) el.value = String(value); }

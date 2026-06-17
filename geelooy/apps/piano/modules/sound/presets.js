/* B"H
The Dream is electric again: reed, tine, pickup, saturation, chorus,
and only a small controlled gleam, never a bell tower drowning the hands.
*/
import { getEffectMode } from '../effects/effectPresets.js';
const BASE = {
    wave1:'wet-electric-keys', wave2:'bell-ep', chordWave:'wet-electric-keys', bassWave:'tonewheel',
    attack:.015, decay:.34, sustain:.62, release:.86, oscMix:.5, detuneCents:10,
    pitchDepth:14, pitchAttack:.006, filterCutoff:7600, filterQ:6.4, lfoRate:3.2, lfoDepth:280,
    fmRatio:2, fmIndex:.68, fmTone:'warm', stereoSpread:.58, driftCents:2.4,
    transientGain:.13, transientMs:12, saturationDrive:1.72, effectMode:'balanced', chorusSend:.46,
    delaySend:.07, delayTime:.24, delayFeedback:.14, reverbSend:.28
};
const rows = [
['awtsmoos-dream-electric','Awtsmoos Dream Electric',{}],
['websynth-8op-fm-glass','WebSynth 8-Op FM Glass',{wave1:'sine',wave2:'crystalline',fmIndex:1.9,fmTone:'bright',reverbSend:.52}],
['websynth-operator-bells','WebSynth Operator Bells',{wave1:'bell-ep',wave2:'metal-hit',fmTone:'glass',fmIndex:1.65,reverbSend:.76}],
['wavetable-morph-pad','Wavetable Morph Pad',{wave1:'soft-pad',wave2:'hyper-saw',attack:.42,sustain:.82,release:2.8,fmTone:'pad',reverbSend:.88}],
['waveedit-glass-table','WaveEdit Glass Table',{wave1:'crystalline',wave2:'shimmer-sine',filterQ:7,fmTone:'glass',reverbSend:.7}],
['bitcrush-chip-lab','Bitcrush Chip Lab',{wave1:'8-bit',wave2:'chiptune',attack:.002,release:.22,filterQ:13,fmTone:'crush',saturationDrive:3.1}],
['wavefolder-brass','Wavefolder Brass Stack',{wave1:'brass-ensemble',wave2:'growl',filterQ:12,fmTone:'fold',saturationDrive:3.35}],
['ott-hyper-pad','OTT Hyper Pad',{wave1:'hyper-saw',wave2:'soft-pad',attack:.12,sustain:.86,release:1.7,chorusSend:.68}],
['granular-clouds','Granular Clouds',{wave1:'drops',wave2:'angel',attack:.18,release:2.4,fmIndex:.52,reverbSend:.9}],
['modular-random-keys','Modular Random Keys',{wave1:'wobble',wave2:'crystalline',filterQ:14,fmIndex:.92,delaySend:.17}],
['fm-bass-matrix','FM Bass Matrix',{wave1:'super-fm',wave2:'neuro-bass',filterCutoff:2400,filterQ:16,fmTone:'bass',saturationDrive:3.8}],
['reese-warp','Reese Warp',{wave1:'reese-bass',wave2:'digital-hoover',detuneCents:24,filterCutoff:3000}],
['acid-filter-lab','Acid Filter Lab',{wave1:'acid-pulse',wave2:'sawtooth',attack:.002,release:.25,filterQ:22,saturationDrive:4.1}],
['dx-glass-ep','DX Glass EP',{wave1:'wet-electric-keys',wave2:'shimmer-sine',attack:.012,release:1.08,fmTone:'bright',fmIndex:1.05,reverbSend:.42}],
['warm-rhodes-cloud','Warm Rhodes Cloud',{wave1:'wet-electric-keys',wave2:'bell-ep',attack:.024,release:1.1,fmTone:'warm',fmIndex:.58,reverbSend:.44}],
['wurli-bark','Wurli Bark',{wave1:'growl',wave2:'wet-electric-keys',attack:.01,release:.54,fmTone:'bark',saturationDrive:2.45}],
['cinematic-synth-keys','Cinematic Synth Keys',{wave1:'hyper-saw',wave2:'shimmer-sine',attack:.08,release:1.55,fmTone:'pad',reverbSend:.82}],
['vocal-formant-choir','Vocal Formant Choir',{wave1:'vox',wave2:'angel',attack:.09,release:1.8,filterQ:18,reverbSend:.84}],
['physical-pluck-lab','Physical Pluck Lab',{wave1:'pluck',wave2:'koto',attack:.003,sustain:.28,release:.9,transientGain:.32}],
['hoover-rave-cloud','Hoover Rave Cloud',{wave1:'digital-hoover',wave2:'trance-gate',detuneCents:28,saturationDrive:2.7}]
];
export const SOUND_PRESETS = Object.fromEntries(rows.map(([id,label,patch]) => [id,{...BASE,...patch,id,label}]));
export const PREMIUM_PRESET = SOUND_PRESETS['awtsmoos-dream-electric'];
export const SOUND_PRESET_LIST = Object.values(SOUND_PRESETS);
export function getSoundPreset(id){return SOUND_PRESETS[id] || PREMIUM_PRESET;}
export function readPresetFromElements(elements){
    const base=getSoundPreset(elements.soundPresetSelect?.value), mode=getEffectMode(elements.effectModeSelect?.value || base.effectMode);
    return {...base,...mode,wave1:elements.waveformSelect?.value||base.wave1,wave2:elements.waveform2Select?.value||base.wave2,chordWave:elements.chordWaveformSelect?.value||base.chordWave,bassWave:elements.bassWaveformSelect?.value||base.bassWave,oscMix:num(elements.oscMixSlider,base.oscMix),detuneCents:num(elements.detuneSlider,base.detuneCents),filterCutoff:num(elements.filterCutoffSlider,base.filterCutoff),filterQ:num(elements.filterQSlider,base.filterQ),chorusSend:num(elements.chorusSlider,mode.chorusSend),delaySend:num(elements.delaySlider,mode.delaySend),delayTime:num(elements.delayTimeSlider,mode.delayTime),delayFeedback:num(elements.delayFeedbackSlider,mode.delayFeedback),saturationDrive:num(elements.saturationSlider,mode.saturationDrive),reverbSend:num(elements.reverbSlider,mode.reverbSend)};
}
export function applyPresetToElements(elements,preset){
    set(elements.waveformSelect,preset.wave1); set(elements.waveform2Select,preset.wave2); set(elements.chordWaveformSelect,preset.chordWave); set(elements.bassWaveformSelect,preset.bassWave);
    set(elements.attackSlider,preset.attack); set(elements.decaySlider,preset.decay); set(elements.sustainSlider,preset.sustain); set(elements.releaseSlider,preset.release);
    set(elements.oscMixSlider,preset.oscMix); set(elements.detuneSlider,preset.detuneCents); set(elements.pitchDepthSlider,preset.pitchDepth); set(elements.pitchAttackSlider,preset.pitchAttack);
    set(elements.filterCutoffSlider,preset.filterCutoff); set(elements.filterQSlider,preset.filterQ); set(elements.lfoRateSlider,preset.lfoRate); set(elements.lfoDepthSlider,preset.lfoDepth);
    const mode=getEffectMode(preset.effectMode); set(elements.effectModeSelect,mode.id); set(elements.chorusSlider,preset.chorusSend??mode.chorusSend); set(elements.delaySlider,preset.delaySend??mode.delaySend); set(elements.delayTimeSlider,preset.delayTime??mode.delayTime); set(elements.delayFeedbackSlider,preset.delayFeedback??mode.delayFeedback); set(elements.saturationSlider,preset.saturationDrive??mode.saturationDrive); set(elements.reverbSlider,preset.reverbSend??mode.reverbSend);
}
function num(el,fallback){return parseFloat(el?.value || fallback);} function set(el,value){if(el&&value!==undefined)el.value=String(value);}

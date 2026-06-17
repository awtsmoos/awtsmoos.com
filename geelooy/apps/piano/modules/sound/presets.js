/* B"H
The preset table is now a stage-keyboard map: body first, pickup warmth second, sparkle last.
*/
import { getEffectMode } from '../effects/effectPresets.js';

const BASE = {
    wave1:'wet-electric-keys', wave2:'wet-electric-keys', chordWave:'wet-electric-keys', bassWave:'tonewheel',
    attack:.009, decay:.32, sustain:.78, release:.68, oscMix:.22, detuneCents:5,
    pitchDepth:6, pitchAttack:.004, filterCutoff:6400, filterQ:2.8, lfoRate:2.1, lfoDepth:135,
    fmRatio:1.5, fmIndex:.18, fmTone:'warm', stereoSpread:.48, driftCents:1.4,
    transientGain:.065, transientMs:14, saturationDrive:1.92, effectMode:'balanced', chorusSend:.38,
    delaySend:.025, delayTime:.22, delayFeedback:.08, reverbSend:.18,
    bodyGain:1.18, barkAmount:.16, pickupDrive:1.22, stageTone:-1.8
};

const rows = [
['awtsmoos-dream-electric','Awtsmoos Dream Electric',{}],
['awtsmoos-stage-electric','Awtsmoos Stage Electric',{sustain:.84,release:.62,filterCutoff:6100,chorusSend:.34,reverbSend:.14,bodyGain:1.25,barkAmount:.18}],
['awtsmoos-club-ep','Awtsmoos Club EP',{attack:.007,sustain:.8,release:.58,filterCutoff:7000,filterQ:3.4,chorusSend:.48,saturationDrive:2.08,barkAmount:.24}],
['awtsmoos-warm-rhodes','Awtsmoos Warm Rhodes',{wave2:'bell-ep',attack:.016,decay:.44,sustain:.76,release:.92,oscMix:.16,filterCutoff:5200,filterQ:2.2,fmIndex:.12,chorusSend:.42,reverbSend:.22,bodyGain:1.32,barkAmount:.08}],
['awtsmoos-gospel-keys','Awtsmoos Gospel Keys',{attack:.01,decay:.38,sustain:.88,release:.86,oscMix:.2,filterCutoff:6800,chorusSend:.5,reverbSend:.26,bodyGain:1.3,barkAmount:.14}],
['awtsmoos-vintage-wurli','Awtsmoos Vintage Wurli',{wave1:'growl',wave2:'wet-electric-keys',attack:.008,decay:.24,sustain:.68,release:.5,oscMix:.18,filterCutoff:5600,filterQ:3.8,fmTone:'bark',fmIndex:.34,saturationDrive:2.55,chorusSend:.18,reverbSend:.12,barkAmount:.42}],
['awtsmoos-arena-stage','Awtsmoos Arena Stage',{attack:.012,sustain:.82,release:.95,filterCutoff:7200,chorusSend:.56,delaySend:.06,reverbSend:.34,bodyGain:1.22,barkAmount:.2}],
['websynth-8op-fm-glass','WebSynth 8-Op FM Glass',{wave1:'sine',wave2:'crystalline',oscMix:.62,filterCutoff:11200,filterQ:3.4,fmIndex:1.9,fmTone:'bright',chorusSend:.34,reverbSend:.52,bodyGain:.88,barkAmount:.02}],
['websynth-operator-bells','WebSynth Operator Bells',{wave1:'bell-ep',wave2:'metal-hit',oscMix:.48,attack:.004,decay:.78,sustain:.22,release:1.55,fmTone:'glass',fmIndex:1.65,reverbSend:.76,bodyGain:.82,barkAmount:0}],
['wavetable-morph-pad','Wavetable Morph Pad',{wave1:'soft-pad',wave2:'hyper-saw',attack:.42,sustain:.82,release:2.8,fmTone:'pad',chorusSend:.74,reverbSend:.88}],
['waveedit-glass-table','WaveEdit Glass Table',{wave1:'crystalline',wave2:'shimmer-sine',filterQ:7,fmTone:'glass',fmIndex:1.05,reverbSend:.7}],
['bitcrush-chip-lab','Bitcrush Chip Lab',{wave1:'8-bit',wave2:'chiptune',attack:.002,release:.22,filterQ:13,fmTone:'crush',saturationDrive:3.1,bodyGain:.7}],
['wavefolder-brass','Wavefolder Brass Stack',{wave1:'brass-ensemble',wave2:'growl',filterQ:12,fmTone:'fold',saturationDrive:3.35,barkAmount:.3}],
['ott-hyper-pad','OTT Hyper Pad',{wave1:'hyper-saw',wave2:'soft-pad',attack:.12,sustain:.86,release:1.7,chorusSend:.68,bodyGain:.95}],
['granular-clouds','Granular Clouds',{wave1:'drops',wave2:'angel',attack:.18,release:2.4,fmIndex:.52,reverbSend:.9,bodyGain:.8}],
['modular-random-keys','Modular Random Keys',{wave1:'wobble',wave2:'crystalline',filterQ:14,fmIndex:.92,delaySend:.17}],
['fm-bass-matrix','FM Bass Matrix',{wave1:'super-fm',wave2:'neuro-bass',filterCutoff:2400,filterQ:16,fmTone:'bass',saturationDrive:3.8,bodyGain:1.4}],
['reese-warp','Reese Warp',{wave1:'reese-bass',wave2:'digital-hoover',detuneCents:24,filterCutoff:3000,bodyGain:1.3}],
['acid-filter-lab','Acid Filter Lab',{wave1:'acid-pulse',wave2:'sawtooth',attack:.002,release:.25,filterQ:22,saturationDrive:4.1,barkAmount:.35}],
['dx-glass-ep','DX Glass EP',{wave1:'wet-electric-keys',wave2:'shimmer-sine',attack:.012,release:1.08,fmTone:'bright',fmIndex:.82,reverbSend:.34,bodyGain:.98}],
['warm-rhodes-cloud','Warm Rhodes Cloud',{wave1:'wet-electric-keys',wave2:'bell-ep',attack:.024,release:1.1,fmTone:'warm',fmIndex:.38,reverbSend:.36,bodyGain:1.28}],
['wurli-bark','Wurli Bark',{wave1:'growl',wave2:'wet-electric-keys',attack:.01,release:.54,fmTone:'bark',saturationDrive:2.45,barkAmount:.48}],
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

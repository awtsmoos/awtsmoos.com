/* B"H
A warmer cardboard-synth inspired preset atlas: lowpass before glitter, water before glass.
*/
import { getEffectMode } from '../effects/effectPresets.js';

const BASE = {
    wave1:'wet-electric-keys', wave2:'bell-ep', chordWave:'wet-electric-keys', bassWave:'tonewheel',
    attack:.018, decay:.46, sustain:.86, release:1.05, oscMix:.12, detuneCents:3.2,
    pitchDepth:3.5, pitchAttack:.008, filterCutoff:4050, filterQ:1.45, lfoRate:1.35, lfoDepth:72,
    fmRatio:1.5, fmIndex:.075, fmTone:'warm', stereoSpread:.62, driftCents:2.1,
    transientGain:.028, transientMs:10, saturationDrive:1.42, effectMode:'dream', chorusSend:.68,
    delaySend:.085, delayTime:.31, delayFeedback:.18, reverbSend:.44,
    bodyGain:1.54, barkAmount:.045, pickupDrive:.9, stageTone:-7.4, mudLift:2.4, tineCut:-4.8
};

const rows = [
['awtsmoos-dream-electric','Awtsmoos Dream Electric',{}],
['awtsmoos-main-wet-keys','Awtsmoos Main Wet Keys',{filterCutoff:3650,chorusSend:.74,reverbSend:.52,delaySend:.1,bodyGain:1.62}],
['awtsmoos-cardboard-wet','Awtsmoos Cardboard Wet',{wave2:'soft-pad',attack:.022,release:1.24,oscMix:.18,filterCutoff:3350,lfoRate:.88,lfoDepth:110,chorusSend:.78,reverbSend:.58,bodyGain:1.5}],
['awtsmoos-deep-rhodes','Awtsmoos Deep Rhodes',{attack:.024,decay:.58,sustain:.84,release:1.35,oscMix:.2,filterCutoff:3450,fmIndex:.06,chorusSend:.7,reverbSend:.48,bodyGain:1.72}],
['awtsmoos-velvet-wurli','Awtsmoos Velvet Wurli',{wave1:'growl',wave2:'wet-electric-keys',attack:.014,decay:.34,sustain:.74,release:.88,oscMix:.08,filterCutoff:3850,fmTone:'bark',fmIndex:.16,saturationDrive:1.75,barkAmount:.18,chorusSend:.55,reverbSend:.34}],
['awtsmoos-club-wet-ep','Awtsmoos Club Wet EP',{attack:.012,sustain:.82,release:.82,filterCutoff:4550,filterQ:1.8,chorusSend:.8,delaySend:.12,reverbSend:.5,saturationDrive:1.58}],
['awtsmoos-gospel-cloud','Awtsmoos Gospel Cloud',{attack:.018,decay:.42,sustain:.9,release:1.28,filterCutoff:4300,chorusSend:.82,reverbSend:.6,bodyGain:1.64}],
['awtsmoos-arena-wet-stage','Awtsmoos Arena Wet Stage',{attack:.02,sustain:.88,release:1.45,filterCutoff:4700,chorusSend:.86,delaySend:.15,reverbSend:.68,bodyGain:1.52}],
['websynth-8op-fm-glass','WebSynth 8-Op FM Glass',{wave1:'sine',wave2:'crystalline',oscMix:.44,filterCutoff:7600,filterQ:2.7,fmIndex:.85,fmTone:'bright',chorusSend:.44,reverbSend:.5,stageTone:-3.5,bodyGain:.95}],
['websynth-operator-bells','WebSynth Operator Bells',{wave1:'bell-ep',wave2:'metal-hit',oscMix:.34,attack:.006,decay:.86,sustain:.24,release:1.7,fmTone:'glass',fmIndex:.78,reverbSend:.7,bodyGain:.82,stageTone:-2.5}],
['wavetable-morph-pad','Wavetable Morph Pad',{wave1:'soft-pad',wave2:'hyper-saw',attack:.42,sustain:.82,release:2.8,fmTone:'pad',chorusSend:.74,reverbSend:.88,filterCutoff:6200}],
['waveedit-glass-table','WaveEdit Glass Table',{wave1:'crystalline',wave2:'shimmer-sine',filterQ:5,fmTone:'glass',fmIndex:.72,reverbSend:.7,filterCutoff:7200}],
['bitcrush-chip-lab','Bitcrush Chip Lab',{wave1:'8-bit',wave2:'chiptune',attack:.002,release:.22,filterQ:9,fmTone:'crush',saturationDrive:2.6,bodyGain:.7,filterCutoff:5100}],
['wavefolder-brass','Wavefolder Brass Stack',{wave1:'brass-ensemble',wave2:'growl',filterQ:8,fmTone:'fold',saturationDrive:2.6,barkAmount:.22,filterCutoff:5600}],
['ott-hyper-pad','OTT Hyper Pad',{wave1:'hyper-saw',wave2:'soft-pad',attack:.12,sustain:.86,release:1.7,chorusSend:.68,bodyGain:.95,filterCutoff:6400}],
['granular-clouds','Granular Clouds',{wave1:'drops',wave2:'angel',attack:.18,release:2.4,fmIndex:.32,reverbSend:.9,bodyGain:.8,filterCutoff:5600}],
['modular-random-keys','Modular Random Keys',{wave1:'wobble',wave2:'wet-electric-keys',filterQ:6,fmIndex:.38,delaySend:.17,filterCutoff:4300}],
['fm-bass-matrix','FM Bass Matrix',{wave1:'super-fm',wave2:'neuro-bass',filterCutoff:1800,filterQ:7,fmTone:'bass',saturationDrive:2.7,bodyGain:1.4}],
['reese-warp','Reese Warp',{wave1:'reese-bass',wave2:'digital-hoover',detuneCents:18,filterCutoff:2400,bodyGain:1.3}],
['acid-filter-lab','Acid Filter Lab',{wave1:'acid-pulse',wave2:'sawtooth',attack:.002,release:.25,filterCutoff:3600,filterQ:14,saturationDrive:3.2,barkAmount:.35}],
['dx-wet-ep','DX Wet EP',{wave1:'wet-electric-keys',wave2:'shimmer-sine',attack:.018,release:1.16,filterCutoff:4800,fmTone:'warm',fmIndex:.28,reverbSend:.44,stageTone:-5.2}],
['warm-rhodes-cloud','Warm Rhodes Cloud',{wave1:'wet-electric-keys',wave2:'bell-ep',attack:.032,release:1.35,filterCutoff:3300,fmTone:'warm',fmIndex:.18,reverbSend:.52,bodyGain:1.68}],
['wurli-bark','Wurli Bark',{wave1:'growl',wave2:'wet-electric-keys',attack:.012,release:.62,filterCutoff:3900,fmTone:'bark',saturationDrive:2,barkAmount:.34}],
['cinematic-synth-keys','Cinematic Synth Keys',{wave1:'hyper-saw',wave2:'shimmer-sine',attack:.08,release:1.55,fmTone:'pad',reverbSend:.82,filterCutoff:5800}],
['vocal-formant-choir','Vocal Formant Choir',{wave1:'vox',wave2:'angel',attack:.09,release:1.8,filterQ:9,reverbSend:.84,filterCutoff:5200}],
['physical-pluck-lab','Physical Pluck Lab',{wave1:'pluck',wave2:'koto',attack:.003,sustain:.28,release:.9,transientGain:.22,filterCutoff:5000}],
['hoover-rave-cloud','Hoover Rave Cloud',{wave1:'digital-hoover',wave2:'trance-gate',detuneCents:22,saturationDrive:2.2,filterCutoff:5200}]
];
export const SOUND_PRESETS = Object.fromEntries(rows.map(([id,label,patch]) => [id,{...BASE,...patch,id,label}]));
export const PREMIUM_PRESET = SOUND_PRESETS['awtsmoos-dream-electric'];
export const SOUND_PRESET_LIST = Object.values(SOUND_PRESETS);
export function getSoundPreset(id){return SOUND_PRESETS[id] || PREMIUM_PRESET;}
export function readPresetFromElements(elements){
    const base=getSoundPreset(elements.soundPresetSelect?.value), mode=getEffectMode(elements.effectModeSelect?.value || base.effectMode);
    return {...base,...mode,wave1:elements.waveformSelect?.value||base.wave1,wave2:elements.waveform2Select?.value||base.wave2,chordWave:elements.chordWaveformSelect?.value||base.chordWave,bassWave:elements.bassWaveformSelect?.value||base.bassWave,oscMix:num(elements.oscMixSlider,base.oscMix),detuneCents:num(elements.detuneSlider,base.detuneCents),filterCutoff:num(elements.filterCutoffSlider,base.filterCutoff),filterQ:num(elements.filterQSlider,base.filterQ),chorusSend:num(elements.chorusSlider,base.chorusSend??mode.chorusSend),delaySend:num(elements.delaySlider,base.delaySend??mode.delaySend),delayTime:num(elements.delayTimeSlider,base.delayTime??mode.delayTime),delayFeedback:num(elements.delayFeedbackSlider,base.delayFeedback??mode.delayFeedback),saturationDrive:num(elements.saturationSlider,base.saturationDrive??mode.saturationDrive),reverbSend:num(elements.reverbSlider,base.reverbSend??mode.reverbSend)};
}
export function applyPresetToElements(elements,preset){
    set(elements.waveformSelect,preset.wave1); set(elements.waveform2Select,preset.wave2); set(elements.chordWaveformSelect,preset.chordWave); set(elements.bassWaveformSelect,preset.bassWave);
    set(elements.attackSlider,preset.attack); set(elements.decaySlider,preset.decay); set(elements.sustainSlider,preset.sustain); set(elements.releaseSlider,preset.release);
    set(elements.oscMixSlider,preset.oscMix); set(elements.detuneSlider,preset.detuneCents); set(elements.pitchDepthSlider,preset.pitchDepth); set(elements.pitchAttackSlider,preset.pitchAttack);
    set(elements.filterCutoffSlider,preset.filterCutoff); set(elements.filterQSlider,preset.filterQ); set(elements.lfoRateSlider,preset.lfoRate); set(elements.lfoDepthSlider,preset.lfoDepth);
    const mode=getEffectMode(preset.effectMode); set(elements.effectModeSelect,mode.id); set(elements.chorusSlider,preset.chorusSend??mode.chorusSend); set(elements.delaySlider,preset.delaySend??mode.delaySend); set(elements.delayTimeSlider,preset.delayTime??mode.delayTime); set(elements.delayFeedbackSlider,preset.delayFeedback??mode.delayFeedback); set(elements.saturationSlider,preset.saturationDrive??mode.saturationDrive); set(elements.reverbSlider,preset.reverbSend??mode.reverbSend);
}
function num(el,fallback){return parseFloat(el?.value || fallback);} function set(el,value){if(el&&value!==undefined)el.value=String(value);}

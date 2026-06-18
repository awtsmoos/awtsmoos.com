/* B"H
Every sound is a guest in the palace. When its song ends, every wire must bow, detach, and return to silence.
*/
import { AudioState } from './audio.js';
import { elements } from './ui.js';
import { customWaves } from './waveforms.js';
import { readPresetFromElements } from './sound/presets.js';
import { createVelocity, humanize } from './sound/velocity.js';
import { setChorusAmount } from './sound/chorus.js';
import { setDelay } from './effects/delay.js';
import { createSaturator } from './sound/saturation.js';
const MAIN_GAIN = .31, CHORD_GAIN = .13, BASS_GAIN = .22, MAX_LIVE_NOTES = 40;
const noiseCache = new WeakMap();
export const activeNotes = new Map();
export let currentChordNodes = [], currentChordRoot = null, noteHistory = [];
export function getADSR() { return { attack: num(elements.attackSlider, .006), decay: num(elements.decaySlider, .24), sustain: num(elements.sustainSlider, .5) }; }
export function createSynthNode(isChord = false, isBass = false, options = {}) {
    if (!AudioState.context || AudioState.context.state === 'closed') return null;
    const ctx = AudioState.context, p = readPresetFromElements(elements), v = createVelocity(options.inputId, options.coords), h = humanize(p, v);
    const osc1 = ctx.createOscillator(), osc2 = ctx.createOscillator(), noiseGain = ctx.createGain(), g1 = ctx.createGain(), g2 = ctx.createGain(), mix = ctx.createGain();
    const filter = ctx.createBiquadFilter(), amp = ctx.createGain(), drive = createSaturator(ctx, p.saturationDrive || 2.2), pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    const lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
    osc1.connect(g1); osc2.connect(g2); g1.connect(mix); g2.connect(mix); noiseGain.connect(mix); mix.connect(filter); filter.connect(amp); amp.connect(drive); drive.connect(pan); pan.connect(AudioState.masterGain);
    lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
    if (AudioState.convolver) pan.connect(AudioState.convolver);
    if (AudioState.chorus) pan.connect(AudioState.chorus.input);
    if (AudioState.delayRack) pan.connect(AudioState.delayRack.input);
    const nodes = { osc1, osc2, noiseGain, g1, g2, mix, filter, amp, drive, pan, lfo, lfoGain, noise: null, preset: p, velocity: v, human: h, isChord, isBass, stopped: false, disposed: false, disposeTimer: null };
    applyCurrentParameters(nodes, isChord, isBass);
    return nodes;
}
export function applyCurrentParameters(n, isChord, isBass = false) {
    if (!n || n.disposed) return;
    const ctx = AudioState.context, now = ctx.currentTime, p = readPresetFromElements(elements);
    n.preset = p; applyWave(n.osc1, isBass ? (p.bassWave || 'triangle') : (isChord ? p.chordWave : p.wave1)); applyWave(n.osc2, p.wave2);
    n.g1.gain.setTargetAtTime(1 - clamp(p.oscMix, 0, .95), now, .01); n.g2.gain.setTargetAtTime(clamp(p.oscMix, 0, .95), now, .01); n.noiseGain.gain.setTargetAtTime(p.noiseGain || 0, now, .02); n.mix.gain.setTargetAtTime(p.sourceGain || 1, now, .015);
    n.filter.type = p.filterType || 'lowpass'; n.filter.Q.setTargetAtTime(clamp(p.filterQ || 6, .1, 22), now, .012); n.filter.frequency.setTargetAtTime(clamp((p.filterCutoff || 900) * n.human.brightness, 45, 9000), now, .018);
    n.lfo.frequency.setTargetAtTime(clamp(p.lfoRate || 0, 0, 18), now, .02); n.lfoGain.gain.setTargetAtTime(clamp(p.lfoToFilter || 0, 0, 1600), now, .03); if (n.pan.pan) n.pan.pan.setTargetAtTime(n.human.pan * (p.stereoSpread || .35), now, .025);
    AudioState.wetGain?.gain.setTargetAtTime(p.reverbSend || 0, now, .05); setChorusAmount(AudioState.chorus, p.chorusSend || 0, now); setDelay(AudioState.delayRack, p.delaySend || 0, now, p.delayTime, p.delayFeedback);
}
export function startSynth(n, frequency, noteName = '') {
    if (!n || n.disposed) return;
    const ctx = AudioState.context, now = ctx.currentTime, p = n.preset, adsr = getADSR(); n.noteName = noteName;
    n.osc1.frequency.setValueAtTime(frequency * cents(p.env2PitchCents || 0), now); n.osc2.frequency.setValueAtTime(frequency * cents((p.env2PitchCents || 0) * .45), now);
    n.osc1.frequency.exponentialRampToValueAtTime(frequency, now + Math.max(.025, p.env2Decay || .11)); n.osc2.frequency.exponentialRampToValueAtTime(frequency, now + Math.max(.025, p.env2Decay || .11));
    n.osc1.detune.setValueAtTime(n.human.drift - (p.detuneCents || 0) * .5, now); n.osc2.detune.setValueAtTime(n.human.drift + (p.detuneCents || 0) * .5, now); if ((p.noiseGain || 0) > 0) n.noise = startNoise(ctx, n.noiseGain, now);
    const peak = (n.isChord ? CHORD_GAIN : n.isBass ? BASS_GAIN : MAIN_GAIN) * n.velocity * (p.outputTrim || 1), attack = Math.max(.002, p.attack || adsr.attack), decay = Math.max(.012, p.decay || adsr.decay), sustain = p.sustain ?? adsr.sustain;
    n.amp.gain.cancelScheduledValues(now); n.amp.gain.setValueAtTime(.0001, now); n.amp.gain.linearRampToValueAtTime(peak, now + attack); n.amp.gain.setTargetAtTime(peak * sustain, now + attack, decay);
    const baseCut = clamp((p.filterCutoff || 900) * n.human.brightness, 45, 8500), topCut = clamp(baseCut * (p.env1FilterMult || 3.8), 80, 10000);
    n.filter.frequency.cancelScheduledValues(now); n.filter.frequency.setValueAtTime(topCut, now); n.filter.frequency.exponentialRampToValueAtTime(baseCut, now + Math.max(.035, p.env1Decay || .24));
    safeStart(n.lfo, now); safeStart(n.osc1, now); safeStart(n.osc2, now);
}
export function stopSynth(n, fast = false) {
    if (!n || n.disposed || n.stopped) return; n.stopped = true;
    const ctx = AudioState.context, now = ctx.currentTime, release = fast ? .035 : Math.max(.03, num(elements.releaseSlider, n.preset?.release || .5));
    try { n.amp.gain.cancelScheduledValues(now); n.amp.gain.setValueAtTime(Math.max(.0001, n.amp.gain.value || .0001), now); n.amp.gain.exponentialRampToValueAtTime(.0001, now + release); } catch (_) {}
    [n.osc1, n.osc2, n.noise, n.lfo].forEach(node => stopNode(node, now + release + .04));
    n.disposeTimer = setTimeout(() => disposeSynth(n), Math.ceil((release + .18) * 1000));
}
export function disposeSynth(n) {
    if (!n || n.disposed) return; n.disposed = true; clearTimeout(n.disposeTimer);
    [n.osc1, n.osc2, n.noise, n.lfo, n.lfoGain, n.noiseGain, n.g1, n.g2, n.mix, n.filter, n.amp, n.drive, n.pan].forEach(disconnectNode);
}
export function panicStopAll() {
    [...activeNotes.values()].forEach(x => { x.keyElement?.classList.remove('active'); stopSynth(x.synthNodes, true); }); activeNotes.clear(); clearCurrentChord(true);
}
export function enforceVoiceLimit() { while (activeNotes.size > MAX_LIVE_NOTES) { const [id, note] = activeNotes.entries().next().value; note.keyElement?.classList.remove('active'); stopSynth(note.synthNodes, true); activeNotes.delete(id); } }
export function updateAllActiveNotesParameters() { [...activeNotes.values()].map(x => x.synthNodes).concat(currentChordNodes).forEach(n => n && applyCurrentParameters(n, currentChordNodes.includes(n), n.isBass)); }
export function setCurrentChordNodes(nodes) { currentChordNodes = nodes; }
export function setCurrentChordRoot(root) { currentChordRoot = root; }
export function clearCurrentChord(fast = false) { currentChordNodes.forEach(n => stopSynth(n, fast)); currentChordNodes = []; currentChordRoot = null; }
function startNoise(ctx, target, when) { let b = noiseCache.get(ctx); if (!b) { b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; noiseCache.set(ctx, b); } const s = ctx.createBufferSource(); s.buffer = b; s.loop = true; s.connect(target); s.start(when); return s; }
function applyWave(osc, wave) { customWaves[wave] ? osc.setPeriodicWave(customWaves[wave]) : osc.type = ['sine','square','sawtooth','triangle'].includes(wave) ? wave : 'sawtooth'; }
function safeStart(node, time) { try { node.start(time); } catch (_) {} }
function stopNode(node, time) { try { node?.stop(time); } catch (_) {} }
function disconnectNode(node) { try { node?.disconnect(); } catch (_) {} }
function num(el, fallback) { return parseFloat(el?.value ?? fallback); }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function cents(v) { return Math.pow(2, v / 1200); }

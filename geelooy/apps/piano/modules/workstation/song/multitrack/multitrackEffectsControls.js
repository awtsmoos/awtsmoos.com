//B"H
/** The Awtsmoos reveals the balance of sound through a compact, undoable mixer. */
import { EFFECT_FIELDS, normalizeTrackEffects } from './multitrackEffects.js';
import { findMultitrackTrack, replaceMultitrackTrack } from './multitrackProject.js';
import { createEqCurve } from './multitrackEqCurve.js';

/** The live mix subscriber retunes compatible nodes or stops an obsolete graph. */
export function setTrackEffect(state, trackId, key, value) {
	const track = findMultitrackTrack(state.project,trackId);
	if (!track) throw Error('Choose a track first.');
	if (key !== 'reset' && key !== 'compressor' && !Object.hasOwn(EFFECT_FIELDS,key)) throw Error('Unknown effect.');
	const effects = normalizeTrackEffects(key === 'reset' ? {} : {...track.effects,[key]:value});
	const wasPlaying=state.playing;
	state.setProject(replaceMultitrackTrack(state.project,{...track,effects}));
	if (!wasPlaying || state.playing) state.setStatus('Track effects updated · applies to playback and export.');
}

/** Builds a collapsible effects shelf inside each existing track mixer. */
export function createTrackEffectsControls(track) {
	const shelf = document.createElement('details');
	shelf.className = 'multitrack-effect-shelf';
	const summary = document.createElement('summary');
	summary.textContent = 'EQ & compressor';
	shelf.append(summary);
	const effects = normalizeTrackEffects(track.effects);
	const controls = document.createElement('div');
	controls.className = 'multitrack-nle-tools';
	for (const [key,title,step] of [
		['highpass','High-pass (Hz; 0 = off)',10],
		['lowGain','Bass (dB)',.5],
		['midGain','Mid (dB)',.5],
		['midFrequency','Mid frequency (Hz)',10],
		['midQ','Mid width (Q)',.1],
		['highGain','Treble (dB)',.5],
		['threshold','Threshold (dB)',1],
		['ratio','Ratio',.5],
		['attack','Attack (s)',.001],
		['release','Release (s)',.01]
	]) {
		const label = document.createElement('label');
		label.textContent = title;
		const input = document.createElement('input');
		input.type = 'number';
		input.min = EFFECT_FIELDS[key][0];
		input.max = EFFECT_FIELDS[key][1];
		input.step = step;
		input.value = effects[key];
		input.dataset.trackEffect = key;
		label.append(input);
		controls.append(label);
	}
	const toggle = document.createElement('label');
	const check = document.createElement('input');
	check.type = 'checkbox';
	check.checked = effects.compressor;
	check.dataset.trackEffect = 'compressor';
	toggle.append(check,' Enable compressor');
	const reset = document.createElement('button');
	reset.type = 'button';
	reset.className = 'multitrack-tool';
	reset.dataset.trackEffect = 'reset';
	reset.textContent = 'Reset effects';
	controls.append(toggle,reset);
	shelf.append(controls, createEqCurve(effects, controls));
	return shelf;
}

/** Delegates through the persistent inspector instead of installing per-control listeners. */
export function bindTrackEffectsControls(dom,state,onError) {
	function apply(event) {
		const control = event.target.closest('[data-track-effect]');
		if (!control || (event.type === 'click') !== (control.tagName === 'BUTTON')) return;
		const id = control.closest('[data-track-id]')?.dataset.trackId;
		const key = control.dataset.trackEffect;
		const value = control.type === 'checkbox' ? control.checked : Number(control.value);
		try { setTrackEffect(state,id,key,value); }
		catch(error) { onError(error); }
	}
	dom.inspectorList.addEventListener('change',apply);
	dom.inspectorList.addEventListener('click',apply);
}

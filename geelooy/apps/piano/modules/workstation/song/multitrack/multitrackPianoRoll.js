//B"H
/** The Awtsmoos opens a piano roll where a melody can be drawn, heard and reshaped. */
import { AudioState } from '../../../audio.js';
import {
	addMidiNote, createMidiRegion, duplicateMidiNotes, moveMidiNotes,
	quantizeMidiNotes, removeMidiNotes, resizeMidiNote, setMidiNoteVelocity, transposeMidiRegion
} from './multitrackMidiRegion.js';
import { auditionMidiNote } from './multitrackMidiVoice.js';
import { encodeMidiFile, midiFileToRegions } from './multitrackMidiFile.js';
import { createMultitrackTrack, findMultitrackMidiRegion, replaceMultitrackMidiRegion } from './multitrackProject.js';
import { downloadMultitrackBlob } from './multitrackDownload.js';

export const PIANO_ROLL_LOW = 36;
export const PIANO_ROLL_HIGH = 84;
const ROW = 12;
const PX_PER_SECOND = 60;

/** Pure geometry shared by rendering and pointer handling (unit-tested). */
export function pianoRollPointToNote(x, y, gridSeconds = .25) {
	const pitch = PIANO_ROLL_HIGH - Math.floor(y / ROW);
	const raw = Math.max(0, x / PX_PER_SECOND);
	const start = gridSeconds > 0 ? Math.round(raw / gridSeconds) * gridSeconds : raw;
	return { pitch: Math.max(0, Math.min(127, pitch)), start };
}
export function pianoRollNoteRect(note) {
	return {
		left: note.start * PX_PER_SECOND,
		top: (PIANO_ROLL_HIGH - note.pitch) * ROW,
		width: Math.max(6, note.duration * PX_PER_SECOND),
		height: ROW - 1
	};
}

/** Builds and binds the piano-roll panel; every control edits the shared project. */
export function bindPianoRoll(state) {
	const panel = document.createElement('details');
	panel.className = 'multitrack-piano-roll';
	const summary = document.createElement('summary');
	summary.textContent = '🎹 Piano roll · MIDI regions';
	const body = document.createElement('div');
	body.className = 'multitrack-piano-roll-body';
	panel.append(summary, body);

	const bar = document.createElement('div');
	bar.className = 'multitrack-piano-roll-bar';
	const trackSelect = selectEl('Piano roll track');
	const regionSelect = selectEl('Piano roll region');
	const addTrack = buttonEl('＋ MIDI track', () => {
		const track = createMultitrackTrack({ name: `MIDI ${state.project.tracks.length + 1}`, kind: 'midi' });
		state.setProject({ ...state.project, tracks: [...state.project.tracks, track] });
		ui.trackId = track.id;
	});
	const addRegion = buttonEl('＋ Region at playhead', () => {
		const track = currentTrack();
		if (!track) { state.setStatus('Add a MIDI track first.'); return; }
		const region = createMidiRegion({ name: 'Notes', timelineStart: state.selection.playheadSeconds, duration: 4 });
		replaceTrack(track.id, { ...track, kind: 'midi', midiRegions: [...(track.midiRegions || []), region] });
		ui.regionId = region.id;
	});
	const gridSelect = selectEl('Quantize grid');
	for (const [label, beats] of [['1/4 beat', .25], ['1/2 beat', .5], ['1 beat', 1], ['2 beats', 2]]) {
		const option = document.createElement('option');
		option.value = String(beats); option.textContent = label; gridSelect.appendChild(option);
	}
	gridSelect.value = '.5';
	const quantize = buttonEl('Quantize', () => withRegion(region =>
		replaceRegion(quantizeMidiNotes(region, gridSeconds()))));
	const deleteSelected = buttonEl('Delete note', () => withRegion(region =>
		ui.noteId && replaceRegion(removeMidiNotes(region, [ui.noteId]))));
	const duplicate = buttonEl('Duplicate note', () => withRegion(region => {
		if (!ui.noteId) return;
		const { region: next, copies } = duplicateMidiNotes(region, [ui.noteId], gridSeconds() * 2);
		replaceRegion(next); if (copies[0]) ui.noteId = copies[0].id;
	}));
	const transposeDown = buttonEl('−1 semitone', () => withRegion(region => replaceRegion(transposeMidiRegion(region, -1))));
	const transposeUp = buttonEl('+1 semitone', () => withRegion(region => replaceRegion(transposeMidiRegion(region, 1))));
	const sustain = buttonEl('＋ Sustain at region start', () => withRegion(region =>
		replaceRegion({ ...region, sustain: [...(region.sustain || []), { start: 0, duration: 1 }] })));
	const velocity = document.createElement('input');
	velocity.type = 'range'; velocity.min = '1'; velocity.max = '127'; velocity.value = '100';
	velocity.setAttribute('aria-label', 'Selected note velocity');
	velocity.addEventListener('change', () => withRegion(region =>
		ui.noteId && replaceRegion(setMidiNoteVelocity(region, ui.noteId, Number(velocity.value)))));
	const exportMidi = buttonEl('Export .mid', () => {
		const bytes = encodeMidiFile(state.project);
		downloadMultitrackBlob(new Blob([bytes], { type: 'audio/midi' }), `${state.project.title} midi`, 'mid');
		state.setStatus('MIDI file exported from the editable regions.');
	});
	const importLabel = document.createElement('label');
	importLabel.className = 'multitrack-tool';
	importLabel.textContent = 'Import .mid';
	const importInput = document.createElement('input');
	importInput.type = 'file'; importInput.accept = '.mid,.midi,audio/midi'; importInput.hidden = true;
	importLabel.appendChild(importInput);
	importInput.addEventListener('change', async () => {
		const file = importInput.files?.[0];
		if (!file) return;
		try {
			const { regions } = midiFileToRegions(new Uint8Array(await file.arrayBuffer()));
			if (!regions.length) throw Error('No notes found in that MIDI file.');
			let tracks = [...state.project.tracks];
			for (const regionInput of regions) {
				const region = createMidiRegion(regionInput);
				tracks = [...tracks, createMultitrackTrack({ name: region.name, kind: 'midi', midiRegions: [region] })];
			}
			state.setProject({ ...state.project, tracks });
			state.setStatus(`Imported ${regions.length} MIDI region(s).`);
		} catch (error) { state.setStatus(error.message || 'MIDI import failed.'); }
		importInput.value = '';
	});
	bar.append(trackSelect, regionSelect, addTrack, addRegion, gridSelect, quantize,
		deleteSelected, duplicate, transposeDown, transposeUp, sustain, velocity, exportMidi, importLabel);

	const scroller = document.createElement('div');
	scroller.className = 'multitrack-piano-roll-scroll';
	const grid = document.createElement('div');
	grid.className = 'multitrack-piano-roll-grid';
	grid.style.height = `${(PIANO_ROLL_HIGH - PIANO_ROLL_LOW + 1) * ROW}px`;
	scroller.appendChild(grid);
	body.append(bar, scroller);
	const ui = { trackId: null, regionId: null, noteId: null };

	function gridSeconds() { return (60 / state.project.tempo) * Number(gridSelect.value || .5); }
	function currentTrack() {
		return state.project.tracks.find(t => t.id === ui.trackId) || state.project.tracks.find(t => (t.midiRegions || []).length) || null;
	}
	function currentRegion() {
		const track = currentTrack();
		if (!track) return null;
		return (track.midiRegions || []).find(r => r.id === ui.regionId) || (track.midiRegions || [])[0] || null;
	}
	function replaceTrack(trackId, next) {
		state.setProject({ ...state.project, tracks: state.project.tracks.map(t => t.id === trackId ? next : t) });
	}
	function replaceRegion(region) {
		state.setProject(replaceMultitrackMidiRegion(state.project, region));
	}
	function withRegion(action) { const region = currentRegion(); if (region) action(region); }

	grid.addEventListener('pointerdown', event => {
		if (event.target !== grid) return;
		const region = currentRegion();
		if (!region) { state.setStatus('Add a MIDI region before drawing notes.'); return; }
		const rect = grid.getBoundingClientRect();
		const { pitch, start } = pianoRollPointToNote(event.clientX - rect.left, event.clientY - rect.top, gridSeconds());
		if (start >= region.duration) return;
		const { region: next, note } = addMidiNote(region, { pitch, start, duration: gridSeconds(), velocity: Number(velocity.value) });
		ui.noteId = note.id;
		replaceRegion(next);
		audition(pitch);
	});

	function audition(pitch) {
		try {
			if (AudioState.context && AudioState.masterGain)
				auditionMidiNote(AudioState.context, AudioState.masterGain, pitch, Number(velocity.value));
		} catch (_) { /* Audio not started yet; drawing still works. */ }
	}

	function render() {
		const track = currentTrack();
		if (track) ui.trackId = track.id;
		trackSelect.replaceChildren();
		for (const candidate of state.project.tracks) {
			const option = document.createElement('option');
			option.value = candidate.id; option.textContent = candidate.name;
			option.selected = candidate.id === ui.trackId;
			trackSelect.appendChild(option);
		}
		const region = currentRegion();
		if (region) ui.regionId = region.id;
		regionSelect.replaceChildren();
		for (const candidate of track?.midiRegions || []) {
			const option = document.createElement('option');
			option.value = candidate.id; option.textContent = `${candidate.name} @ ${candidate.timelineStart.toFixed(1)}s`;
			option.selected = candidate.id === ui.regionId;
			regionSelect.appendChild(option);
		}
		grid.replaceChildren();
		if (!region) return;
		grid.style.width = `${Math.max(300, region.duration * PX_PER_SECOND)}px`;
		for (const pedal of region.sustain || []) {
			const band = document.createElement('div');
			band.className = 'multitrack-piano-roll-sustain';
			band.style.left = `${pedal.start * PX_PER_SECOND}px`;
			band.style.width = `${pedal.duration * PX_PER_SECOND}px`;
			band.title = 'Sustain pedal';
			grid.appendChild(band);
		}
		for (const note of region.notes) {
			const element = document.createElement('div');
			element.className = 'multitrack-piano-roll-note' + (note.id === ui.noteId ? ' is-selected' : '');
			element.dataset.noteId = note.id;
			const rect = pianoRollNoteRect(note);
			Object.assign(element.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
			element.title = `Pitch ${note.pitch} · velocity ${note.velocity}`;
			element.addEventListener('pointerdown', event => startNoteGesture(event, region, note, element));
			grid.appendChild(element);
		}
	}

	function startNoteGesture(event, region, note, element) {
		event.preventDefault(); event.stopPropagation();
		ui.noteId = note.id;
		const resizing = event.clientX - element.getBoundingClientRect().left > element.offsetWidth - 7;
		const startX = event.clientX, startY = event.clientY;
		const before = region;
		function move(moveEvent) {
			const dx = (moveEvent.clientX - startX) / PX_PER_SECOND;
			const dy = Math.round((moveEvent.clientY - startY) / ROW);
			if (resizing) element.style.width = `${Math.max(6, (note.duration + dx) * PX_PER_SECOND)}px`;
			else {
				element.style.left = `${Math.max(0, (note.start + dx)) * PX_PER_SECOND}px`;
				element.style.top = `${(PIANO_ROLL_HIGH - note.pitch + dy) * ROW}px`;
			}
			element._dx = dx; element._dy = dy;
		}
		function up() {
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
			const dx = element._dx || 0, dy = element._dy || 0;
			if (resizing) replaceRegion(resizeMidiNote(before, note.id, Math.max(.05, note.duration + dx)));
			else if (dx || dy) { replaceRegion(moveMidiNotes(before, [note.id], -dy, dx)); audition(note.pitch - dy); }
			else render();
		}
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
		render();
	}

	trackSelect.addEventListener('change', () => { ui.trackId = trackSelect.value; ui.regionId = null; render(); });
	regionSelect.addEventListener('change', () => { ui.regionId = regionSelect.value; render(); });
	state.subscribe(render);
	render();
	return panel;
}

function selectEl(label) {
	const element = document.createElement('select');
	element.className = 'multitrack-tool';
	element.setAttribute('aria-label', label);
	return element;
}
function buttonEl(text, action) {
	const element = document.createElement('button');
	element.type = 'button'; element.className = 'multitrack-tool'; element.textContent = text;
	element.addEventListener('click', action);
	return element;
}

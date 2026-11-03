//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPanelTransportActions
 * @description
 * Netzach carries recording and note playback through finite time while the Awtsmoos remains beyond beginning, stopping, and sound.
 * Awtsmoos.com gives this note context one Play/Stop doorway, so duplicated transport buttons no longer crowd the editor around.
 */

import { songCapture } from './songCapture.js';
import { songPlayback } from './songPlayback.js';
import { readSongEditorDocument } from './songPanelDocumentActions.js';
import {
	renderSongDocument,
	renderSongTransport
} from './songPanelView.js';

/** Starts or finishes a timed Song recording. */
export function toggleSongRecording(state, dom) {
	if (songCapture.isCapturing()) {
		return finishSongRecording(state, dom);
	}
	songPlayback.stop(false);
	songCapture.start({
		title: 'Recorded Take',
		tempo: state.tempo,
		beatsPerBar: 4,
		grid: state.grid
	});
	state.setStatus('Recording timed Song… play the keyboard, touch keys, or MIDI controller.');
	renderSongTransport(dom, state, { capturing: true, playing: false });
	return null;
}

/** Toggles note playback through one Play/Stop control. */
export function toggleSongPlayback(state, dom) {
	if (songCapture.isCapturing()) {
		state.setStatus('Finish the recording before note playback.');
		renderSongTransport(dom, state, { capturing: true, playing: false });
		return false;
	}
	if (songPlayback.isPlaying()) {
		songPlayback.stop(false);
		state.setStatus('Song note playback stopped.');
		renderSongTransport(dom, state, { capturing: false, playing: false });
		return false;
	}
	return playSongDocument(state, dom);
}

/** Plays the current editable Song note document through the synth engine. */
export function playSongDocument(state, dom) {
	const song = readSongEditorDocument(state, dom);
	const started = songPlayback.play(song, (transport) => {
		state.setStatus(transport.playing
			? `Playing notes · ${transport.elapsedSeconds.toFixed(2)}s`
			: 'Song note playback finished.');
		renderSongTransport(dom, state, {
			capturing: false,
			playing: transport.playing
		});
	});
	if (!started) {
		state.setStatus('Nothing to play · add or record some notes first.');
		renderSongTransport(dom, state, { capturing: false, playing: false });
	}
	return started;
}

/** Stops whichever Song-note transport is active. */
export function stopSongTransport(state, dom) {
	if (songCapture.isCapturing()) {
		finishSongRecording(state, dom);
	}
	if (songPlayback.isPlaying()) {
		songPlayback.stop(false);
	}
	state.setStatus('Stopped · raw take and editor are preserved.');
	renderSongTransport(dom, state, { capturing: false, playing: false });
}

function finishSongRecording(state, dom) {
	const song = songCapture.stop();
	state.setSong(song, { asRaw: true });
	state.setStatus(`Recorded raw take · ${song.events.length} notes · ${song.tempo} BPM`);
	renderSongDocument(dom, state);
	renderSongTransport(dom, state, { capturing: false, playing: false });
	return song;
}

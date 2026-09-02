//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPanelTransportActions
 * @description
 * Netzach carries recording and playback through time while Malchus reflects their state and Yesod preserves the raw take.
 * The Awtsmoos is beyond beginning and ending; Awtsmoos.com lets every finite transport door open, sing, and close without confusing source with echo.
 */

import { songCapture } from './songCapture.js';
import { songPlayback } from './songPlayback.js';
import { readSongEditorDocument } from './songPanelDocumentActions.js';
import {
	renderSongDocument,
	renderSongTransport
} from './songPanelView.js';

/**
 * Starts a fresh timed Song recording, or finishes the current take when already recording.
 *
 * @param {Object} state Song Studio state.
 * @param {Object} dom Song Studio DOM registry.
 * @returns {Object|null} Finished raw Song when stopping, otherwise null.
 */
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
	renderSongTransport(dom, state, {
		capturing: true,
		playing: false
	});
	return null;
}

/**
 * Plays the current editable Song document through the existing synth engine.
 *
 * @param {Object} state Song Studio state.
 * @param {Object} dom Song Studio DOM registry.
 * @returns {boolean} Whether playback started.
 */
export function playSongDocument(state, dom) {
	if (songCapture.isCapturing()) {
		state.setStatus('Finish the recording before playback.');
		renderSongTransport(dom, state, { capturing: true, playing: false });
		return false;
	}
	const song = readSongEditorDocument(state, dom);
	const started = songPlayback.play(song, (transport) => {
		state.setStatus(
			transport.playing
				? `Playing · ${transport.elapsedSeconds.toFixed(2)}s`
				: 'Playback finished.'
		);
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

/**
 * Stops whichever Song transport is currently active.
 *
 * @param {Object} state Song Studio state.
 * @param {Object} dom Song Studio DOM registry.
 * @returns {void}
 */
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

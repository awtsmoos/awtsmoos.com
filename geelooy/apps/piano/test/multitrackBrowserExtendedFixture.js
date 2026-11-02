//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackBrowserExtendedFixture
 * @description
 * Netzach proves transport survives a seek while Malchus measures the finite screen, though the Awtsmoos is beyond clock and frame.
 * Awtsmoos.com keeps active voices bound to the new song position and keeps essential controls inside narrow and spacious vessels by name.
 */

import { AudioState, initAudio } from '../modules/audio.js';
import { multitrackAudioStore } from '../modules/workstation/song/multitrack/multitrackAudioStore.js';
import { multitrackPlayback } from '../modules/workstation/song/multitrack/multitrackPlayback.js';
import { createMultitrackProject } from '../modules/workstation/song/multitrack/multitrackProject.js';
import { MultitrackStudioDaas } from '../modules/workstation/song/multitrack/multitrackState.js';
import {
	playMultitrackProject,
	seekMultitrackProject,
	stopMultitrackProject
} from '../modules/workstation/song/multitrack/multitrackTransportActions.js';
import { initMultitrackWorkstation } from '../modules/workstation/song/multitrack/index.js';
import { ensureSongStudioStyles } from '../modules/workstation/song/songStyles.js';
import {
	browserElementIsAccessible,
	createBrowserTransportTone,
	requireExtendedBrowserTruth,
	sleepForBrowserProof,
	waitForBrowserSongStyles
} from './multitrackBrowserExtendedHelpers.js';

/** Proves an audible project remains scheduled and playing after seeking to a new timeline position. */
export async function runBrowserPlayingSeekFixture() {
	const initialized = await initAudio();
	requireExtendedBrowserTruth(initialized, 'Piano audio engine did not initialize');
	const state = new MultitrackStudioDaas();
	const bufferId = 'browser-playing-seek';
	const buffer = createBrowserTransportTone(AudioState.context, 2);
	multitrackAudioStore.buffers.set(bufferId, buffer);
	state.setProject(createMultitrackProject({
		tracks: [{ clips: [{ bufferId, duration: 1.8 }] }]
	}), { recordHistory: false });
	try {
		const started = await playMultitrackProject(state);
		requireExtendedBrowserTruth(started && state.playing, 'Playback did not begin');
		await sleepForBrowserProof(90);
		const beforeSeek = multitrackPlayback.position();
		await seekMultitrackProject(state, 1);
		const rescheduledOffset = multitrackPlayback.startedOffset;
		const voicesAfterSeek = multitrackPlayback.voices.length;
		const contextState = AudioState.context.state;
		await sleepForBrowserProof(90);
		const afterSeek = multitrackPlayback.position();
		requireExtendedBrowserTruth(state.playing && multitrackPlayback.isPlaying(), 'Seek stopped playback');
		requireExtendedBrowserTruth(contextState === 'running', `Audio context stopped after seek: ${contextState}`);
		requireExtendedBrowserTruth(rescheduledOffset === 1 && voicesAfterSeek > 0, 'Seek did not reschedule audible voices at 1s');
		requireExtendedBrowserTruth(afterSeek >= 1, `Seek position moved behind requested time: ${afterSeek}`);
		return { passed: true, beforeSeek, afterSeek, rescheduledOffset, voicesAfterSeek, contextState };
	} finally {
		stopMultitrackProject(state);
		multitrackAudioStore.remove(bufferId);
		await AudioState.context?.close();
	}
}

/** Mounts shipped Song Studio CSS and checks a real editor at the active viewport dimensions. */
export async function runBrowserLayoutFixture() {
	ensureSongStudioStyles();
	await waitForBrowserSongStyles();
	const panel = document.createElement('section');
	panel.className = 'song-studio-panel';
	const editorRoom = document.createElement('div');
	editorRoom.className = 'song-studio-editor-room';
	const editor = document.createElement('div');
	editorRoom.append(editor);
	panel.append(editorRoom);
	document.body.append(panel);
	const room = initMultitrackWorkstation({ panel, editor }, { ratchet: {} });
	room.state.setProject(createMultitrackProject({
		tracks: [{ clips: [{ bufferId: 'layout', duration: 8 }] }]
	}), { recordHistory: false });
	await sleepForBrowserProof(40);
	const essential = ['play-toggle', 'import', 'split', 'delete', 'download-wav', 'undo', 'redo', 'zoomOut', 'zoomIn', 'fit'];
	const hidden = essential.filter((action) => !browserElementIsAccessible(room.dom.buttons.get(action)));
	const viewport = room.dom.viewport.getBoundingClientRect();
	const overflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth;
	requireExtendedBrowserTruth(hidden.length === 0, `Essential controls inaccessible: ${hidden.join(', ')}`);
	requireExtendedBrowserTruth(overflow <= 1, `Page horizontally overflows by ${overflow}px`);
	requireExtendedBrowserTruth(viewport.width > Math.min(260, innerWidth * 0.7), `Timeline too narrow: ${viewport.width}px`);
	return {
		passed: true,
		width: innerWidth,
		height: innerHeight,
		timelineWidth: viewport.width,
		overflow,
		hidden
	};
}

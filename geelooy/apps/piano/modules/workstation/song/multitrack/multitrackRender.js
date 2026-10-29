//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackRender
 * The Awtsmoos reveals the whole performance through a little screen;
 * Awtsmoos.com renders every measure and remembers what the player means.
 */
import { createMultitrackTrackDom } from './multitrackTrackDom.js';
import { songDuration } from './multitrackTimelineOperations.js';

/** @param {Object} dom - Editor. @param {Object} state - Track state. */
export function renderMultitrackProject(dom, state) {
	const seconds = songDuration(state);
	const scale = state.selection.pixelsPerSecond;
	const width = seconds * scale;
	dom.timeline.style.width = `calc(var(--multitrack-header-width) + ${width}px)`;
	renderRuler(dom.ruler, seconds, scale);
	dom.tracks.replaceChildren();
	state.project.tracks.forEach((track) => {
		const view = createMultitrackTrackDom(track, state.selection, width);
		dom.tracks.appendChild(view.root);
	});
	dom.playhead.style.left = `calc(var(--multitrack-header-width) + ${state.selection.playheadSeconds * scale}px)`;
	dom.status.textContent = state.status;
	dom.snapSelect.value = String(state.selection.gridBeats);
	if (document.activeElement !== dom.playheadInput) {
		dom.playheadInput.value = state.selection.playheadSeconds.toFixed(2);
	}
	dom.overview.max = String(seconds);
	if (document.activeElement !== dom.overview) {
		dom.overview.value = String(Math.min(seconds, state.selection.playheadSeconds));
	}
	renderTransportButtons(dom, state);
}

/** @param {HTMLElement} element - Clip. @param {Object} clip - Audio metadata. @param {number} scale - Pixels per second. */
export function renderMultitrackGestureClip(element, clip, scale) {
	element.style.left = `${clip.timelineStart * scale}px`;
	element.style.width = `${Math.max(18, clip.duration * scale)}px`;
	const timing = element.querySelector('.multitrack-clip-timing');
	if (timing) timing.textContent = `${clip.duration.toFixed(2)}s`;
}

/** @param {HTMLElement} root - Ruler. @param {number} seconds - Duration. @param {number} scale - Zoom. */
function renderRuler(root, seconds, scale) {
	root.replaceChildren();
	const step = Math.max(1, Math.ceil(76 / scale), Math.ceil(seconds / 110));
	for (let second = 0; second <= seconds; second += step) {
		const mark = document.createElement('span');
		mark.className = 'multitrack-ruler-mark';
		mark.style.left = `calc(var(--multitrack-header-width) + ${second * scale}px)`;
		mark.textContent = formatTime(second);
		root.appendChild(mark);
	}
}

/** @param {Object} dom - Controls. @param {Object} state - Playback status. */
function renderTransportButtons(dom, state) {
	const play = dom.buttons.get('play');
	const stop = dom.buttons.get('stop');
	if (play) play.disabled = state.playing || state.project.tracks.length === 0;
	if (stop) stop.disabled = !state.playing;
}

/** @param {number} seconds - Timestamp. @returns {string} Friendly duration. */
function formatTime(seconds) {
	const whole = Math.floor(seconds);
	const minutes = Math.floor(whole / 60);
	const remainder = whole % 60;
	return minutes ? `${minutes}:${String(remainder).padStart(2, '0')}` : `${remainder}s`;
}

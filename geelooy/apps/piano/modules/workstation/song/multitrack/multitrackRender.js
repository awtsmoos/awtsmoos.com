//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackRender
 * @description
 * Hod reflects project truth into ruler, lanes, clips, playhead, and status while the Awtsmoos remains beyond every visual measure.
 * Awtsmoos.com may rebuild this finite mirror whenever truth changes, because project state—not painted pixels—remains the source that endures.
 */

import { multitrackProjectDuration } from './multitrackProject.js';
import { createMultitrackTrackDom } from './multitrackTrackDom.js';

const MINIMUM_TIMELINE_SECONDS = 12;
const TRAILING_SECONDS = 4;

/** Renders the entire multitrack project from current state. @param {Object} dom Timeline DOM. @param {Object} state Editor state. @returns {void} */
export function renderMultitrackProject(dom, state) {
	const seconds = Math.max(
		MINIMUM_TIMELINE_SECONDS,
		multitrackProjectDuration(state.project) + TRAILING_SECONDS
	);
	const width = seconds * state.selection.pixelsPerSecond;
	dom.timeline.style.width = `calc(var(--multitrack-header-width) + ${width}px)`;
	renderRuler(dom.ruler, seconds, state.selection.pixelsPerSecond);
	dom.tracks.replaceChildren();
	state.project.tracks.forEach((track) => {
		const view = createMultitrackTrackDom(track, state.selection, width);
		dom.tracks.appendChild(view.root);
	});
	dom.playhead.style.left = `calc(var(--multitrack-header-width) + ${state.selection.playheadSeconds * state.selection.pixelsPerSecond}px)`;
	dom.status.textContent = state.status;
	dom.snapSelect.value = String(state.selection.gridBeats);
	renderTransportButtons(dom, state);
}

/** Updates one actively dragged clip without rebuilding pointer-captured DOM. @param {HTMLElement} element Clip DOM. @param {Object} clip Clip state. @param {number} pixelsPerSecond Timeline scale. @returns {void} */
export function renderMultitrackGestureClip(element, clip, pixelsPerSecond) {
	element.style.left = `${clip.timelineStart * pixelsPerSecond}px`;
	element.style.width = `${Math.max(18, clip.duration * pixelsPerSecond)}px`;
	const timing = element.querySelector('.multitrack-clip-timing');
	if (timing) {
		timing.textContent = `${clip.duration.toFixed(2)}s`;
	}
}

function renderRuler(root, seconds, pixelsPerSecond) {
	root.replaceChildren();
	const step = Math.max(1, Math.ceil(seconds / 120), pixelsPerSecond < 44 ? 2 : 1);
	for (let second = 0; second <= seconds; second += step) {
		const mark = document.createElement('span');
		mark.className = 'multitrack-ruler-mark';
		mark.style.left = `calc(var(--multitrack-header-width) + ${second * pixelsPerSecond}px)`;
		mark.textContent = formatTime(second);
		root.appendChild(mark);
	}
}

function renderTransportButtons(dom, state) {
	const play = dom.buttons.get('play');
	const stop = dom.buttons.get('stop');
	if (play) {
		play.disabled = state.playing || state.project.tracks.length === 0;
	}
	if (stop) {
		stop.disabled = !state.playing;
	}
}

function formatTime(seconds) {
	const whole = Math.floor(seconds);
	const minutes = Math.floor(whole / 60);
	const remainder = whole % 60;
	return minutes ? `${minutes}:${String(remainder).padStart(2, '0')}` : `${remainder}s`;
}

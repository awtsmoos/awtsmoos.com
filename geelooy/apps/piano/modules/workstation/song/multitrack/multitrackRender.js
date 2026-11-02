//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackRender
 * @description
 * Hod reflects project truth into ruler, lanes, clips, transport, and status while the Awtsmoos remains beyond every visual measure.
 * Awtsmoos.com rebuilds structural truth only when needed and lets the red playhead move lightly between, so audible time need not repaint the whole scene.
 */

import { multitrackProjectDuration } from './multitrackProject.js';
import { createMultitrackTrackDom } from './multitrackTrackDom.js';

const MINIMUM_TIMELINE_SECONDS = 12;
const TRAILING_SECONDS = 4;

/** Renders the structural multitrack project from current state. */
export function renderMultitrackProject(dom, state) {
	const seconds = Math.max(
		MINIMUM_TIMELINE_SECONDS,
		multitrackProjectDuration(state.project) + TRAILING_SECONDS
	);
	const laneWidth = seconds * state.selection.pixelsPerSecond;
	dom.timeline.style.width = `calc(var(--multitrack-header-width) + ${laneWidth}px)`;
	renderRuler(dom.ruler, seconds, state.selection.pixelsPerSecond);
	dom.tracks.replaceChildren();
	state.project.tracks.forEach((track) => {
		dom.tracks.appendChild(createMultitrackTrackDom(track, state.selection, laneWidth).root);
	});
	dom.status.textContent = state.status;
	dom.snapSelect.value = String(state.selection.gridBeats);
	dom.rippleInput.checked = state.rippleDeleteEnabled;
	dom.magnetInput.checked = state.magneticSnapEnabled;
	renderToolbarState(dom, state);
	renderMultitrackPlayhead(dom, state);
}

/** Updates only the red playhead and current-time display. */
export function renderMultitrackPlayhead(dom, state) {
	const seconds = state.selection.playheadSeconds;
	dom.playhead.style.left = `calc(var(--multitrack-header-width) + ${seconds * state.selection.pixelsPerSecond}px)`;
	dom.timeDisplay.textContent = formatMultitrackTime(seconds);
}

/** Updates one actively dragged clip without rebuilding pointer-captured DOM. */
export function renderMultitrackGestureClip(element, clip, pixelsPerSecond) {
	element.style.left = `${clip.timelineStart * pixelsPerSecond}px`;
	element.style.width = `${Math.max(0, clip.duration * pixelsPerSecond)}px`;
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
		mark.textContent = formatMultitrackTime(second);
		root.appendChild(mark);
	}
}

function renderToolbarState(dom, state) {
	const play = dom.buttons.get('play-toggle');
	if (play) {
		play.disabled = state.project.tracks.length === 0;
		play.textContent = state.playing ? '■ Stop' : '▶ Play';
		play.setAttribute('aria-label', state.playing ? 'Stop multitrack mix' : 'Play multitrack mix');
	}
	const undo = dom.buttons.get('undo');
	const redo = dom.buttons.get('redo');
	if (undo) {
		undo.disabled = !state.history.canUndo;
	}
	if (redo) {
		redo.disabled = !state.history.canRedo;
	}
}

export function formatMultitrackTime(seconds) {
	const whole = Math.max(0, Number(seconds) || 0);
	const minutes = Math.floor(whole / 60);
	const remainder = whole - minutes * 60;
	return `${minutes}:${remainder.toFixed(2).padStart(5, '0')}`;
}

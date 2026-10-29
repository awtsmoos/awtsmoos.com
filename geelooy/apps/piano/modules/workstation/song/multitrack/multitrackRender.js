//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackRender
 * The Awtsmoos gives ruler and playhead one origin upon the same scale;
 * Awtsmoos.com stops pretending little fragments are longer than their tale.
 */
import { createMultitrackTrackDom } from './multitrackTrackDom.js';
import { songDuration } from './multitrackTimelineOperations.js';
import { updateMultitrackScrollbar } from './multitrackScrollbar.js';

/** @param {Object} dom - Editing surface. @param {Object} state - Editor state. */
export function renderMultitrackProject(dom, state) {
	const seconds = songDuration(state);
	const scale = state.selection.pixelsPerSecond;
	const width = seconds * scale;
	dom.timeline.style.width = `calc(var(--multitrack-header-width) + ${width}px)`;
	renderRuler(dom.ruler, seconds, scale);
	dom.tracks.replaceChildren();
	dom.inspectorList.replaceChildren();
	for (const track of state.project.tracks) {
		const view = createMultitrackTrackDom(track, state.selection, width);
		dom.tracks.appendChild(view.root);
		const row = document.createElement('div');
		row.className = 'multitrack-track-settings';
		row.dataset.trackId = track.id;
		row.appendChild(view.mixer);
		dom.inspectorList.appendChild(row);
	}
	dom.playhead.style.left = `calc(var(--multitrack-header-width) + ${state.selection.playheadSeconds * scale}px)`;
	dom.status.textContent = state.status;
	dom.snapSelect.value = String(state.selection.gridBeats);
	if (dom.rippleCheckbox) dom.rippleCheckbox.checked = state.rippleDelete !== false;
	if (document.activeElement !== dom.playheadInput) {
		dom.playheadInput.value = state.selection.playheadSeconds.toFixed(2);
	}
	dom.overview.max = String(seconds);
	if (document.activeElement !== dom.overview) {
		dom.overview.value = String(Math.min(seconds, state.selection.playheadSeconds));
	}
	renderTransportButtons(dom, state);
	updateMultitrackScrollbar(dom);
	if (dom.horizontalScroll) requestAnimationFrame(() => updateMultitrackScrollbar(dom));
}

/** @param {HTMLElement} element - Active clip. @param {Object} clip - Updated placement. @param {number} scale - Zoom. */
export function renderMultitrackGestureClip(element, clip, scale) {
	const width = Math.max(.5, clip.duration * scale);
	element.style.left = `${clip.timelineStart * scale}px`;
	element.style.width = `${width}px`;
	element.classList.toggle('multitrack-clip-narrow', width < 44);
	element.classList.toggle('multitrack-clip-micro', width < 7);
	const timing = element.querySelector('.multitrack-clip-timing');
	if (timing) timing.textContent = `${clip.duration.toFixed(2)}s`;
}

/** @param {HTMLElement} ruler - Time ruler. @param {number} seconds - Duration. @param {number} scale - Zoom. */
function renderRuler(ruler, seconds, scale) {
	ruler.replaceChildren();
	const every = scale > 80 ? 1 : scale > 30 ? 2 : scale > 12 ? 5 : 10;
	for (let second = 0; second <= seconds && ruler.childElementCount < 240; second += every) {
		const mark = document.createElement('span');
		mark.className = 'multitrack-ruler-mark';
		mark.style.left = `calc(var(--multitrack-header-width) + ${second * scale}px)`;
		mark.textContent = formatTime(second);
		ruler.appendChild(mark);
	}
}

/** @param {Object} dom - Transport buttons. @param {Object} state - Playback status. */
function renderTransportButtons(dom, state) {
	const play = dom.buttons.get('play');
	if (!play) return;
	play.disabled = !state.playing && state.project.tracks.length === 0;
	play.textContent = state.playing ? '■ Stop' : '▶ Play';
	play.setAttribute('aria-label', state.playing ? 'Stop audio playback' : 'Play edited song');
}

/** @param {number} seconds - Song time. @returns {string} Readable ruler label. */
function formatTime(seconds) {
	return seconds >= 60 ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : `${Math.floor(seconds)}s`;
}

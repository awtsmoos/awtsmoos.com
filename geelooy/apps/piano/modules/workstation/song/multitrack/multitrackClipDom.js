//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackClipDom
 * The Awtsmoos gives every sound precisely its allotted span;
 * Awtsmoos.com lets the waveform breathe, held gently by a human hand.
 */
import { createMultitrackWaveformDom } from './multitrackWaveformDom.js';

/** Builds a timeline clip faithful to its audible length at every zoom.
 * @param {Object} clip - Recorded clip metadata.
 * @param {Object} selection - Current view and zoom.
 * @returns {HTMLElement} Selectable non-destructive audio clip.
 */
export function createMultitrackClipDom(clip, selection) {
	const root = document.createElement('div');
	const width = Math.max(.5, clip.duration * selection.pixelsPerSecond);
	const selected = selection.clipId === clip.id;
	root.className = 'multitrack-clip';
	root.dataset.clipId = clip.id;
	root.dataset.multitrackGesture = 'move';
	root.tabIndex = 0;
	root.setAttribute('role', 'option');
	root.setAttribute('aria-selected', String(selected));
	root.classList.toggle('multitrack-clip-selected', selected);
	root.classList.toggle('multitrack-clip-narrow', width < 44);
	root.classList.toggle('multitrack-clip-micro', width < 7);
	root.style.left = `${clip.timelineStart * selection.pixelsPerSecond}px`;
	root.style.width = `${width}px`;
	root.append(createTrimHandle('left', 'Trim clip start'),
		createClipContent(clip, selection.pixelsPerSecond),
		createTrimHandle('right', 'Trim clip end'));
	return root;
}

/** @param {Object} clip - Source clip. @param {number} zoom - Timeline resolution. */
function createClipContent(clip, zoom) {
	const content = document.createElement('div');
	content.className = 'multitrack-clip-content';
	const label = document.createElement('div');
	label.className = 'multitrack-clip-label';
	label.textContent = `${clip.loop ? '↻ ' : ''}${clip.name}`;
	const timing = document.createElement('div');
	timing.className = 'multitrack-clip-timing';
	timing.textContent = `${clip.duration.toFixed(2)}s`;
	content.append(label, createMultitrackWaveformDom(clip, zoom), timing);
	return content;
}

/** @param {string} side - left/right. @param {string} label - Assistive handle name. */
function createTrimHandle(side, label) {
	const handle = document.createElement('span');
	handle.className = `multitrack-trim-handle multitrack-trim-${side}`;
	handle.dataset.multitrackGesture = `trim-${side}`;
	handle.setAttribute('role', 'button');
	handle.setAttribute('aria-label', label);
	return handle;
}

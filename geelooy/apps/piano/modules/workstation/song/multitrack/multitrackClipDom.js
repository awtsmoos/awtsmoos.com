//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackClipDom
 * @description
 * Malchus gives one audio clip a touchable body with two visible trim gates while the Awtsmoos remains beyond boundary and duration.
 * Awtsmoos.com lets a thumb select, drag, and shape the finite garment; waveform, loop state, and timing stay visible instead of hiding inside an abstract chart.
 */

import { createMultitrackWaveformDom } from './multitrackWaveformDom.js';

/**
 * Creates one positioned audio clip DOM element.
 * @param {Object} clip Clip snapshot.
 * @param {Object} selection Editor selection.
 * @returns {HTMLElement} Clip element.
 */
export function createMultitrackClipDom(clip, selection) {
	const root = document.createElement('div');
	const selected = selection.clipId === clip.id;
	root.className = 'multitrack-clip';
	root.dataset.clipId = clip.id;
	root.dataset.multitrackGesture = 'move';
	root.tabIndex = 0;
	root.setAttribute('role', 'option');
	root.setAttribute('aria-selected', String(selected));
	root.classList.toggle('multitrack-clip-selected', selected);
	root.style.left = `${clip.timelineStart * selection.pixelsPerSecond}px`;
	root.style.width = `${Math.max(18, clip.duration * selection.pixelsPerSecond)}px`;
	const leftHandle = createTrimHandle('left', 'Trim clip start');
	const content = createClipContent(clip);
	const rightHandle = createTrimHandle('right', 'Trim clip end');
	root.append(leftHandle, content, rightHandle);
	return root;
}

function createClipContent(clip) {
	const content = document.createElement('div');
	content.className = 'multitrack-clip-content';
	const label = document.createElement('div');
	label.className = 'multitrack-clip-label';
	label.textContent = `${clip.loop ? '↻ ' : ''}${clip.name}`;
	const timing = document.createElement('div');
	timing.className = 'multitrack-clip-timing';
	timing.textContent = `${clip.duration.toFixed(2)}s`;
	content.append(label, createMultitrackWaveformDom(clip), timing);
	return content;
}

function createTrimHandle(side, label) {
	const handle = document.createElement('span');
	handle.className = `multitrack-trim-handle multitrack-trim-${side}`;
	handle.dataset.multitrackGesture = `trim-${side}`;
	handle.setAttribute('role', 'button');
	handle.setAttribute('aria-label', label);
	return handle;
}

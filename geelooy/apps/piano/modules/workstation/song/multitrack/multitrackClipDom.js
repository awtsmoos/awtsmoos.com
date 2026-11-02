//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackClipDom
 * @description
 * Malchus gives one audio clip its truthful finite width while the Awtsmoos remains beyond boundary and duration.
 * Awtsmoos.com separates visible waveform from generous trim hit-gates, so a tiny fragment stays tiny yet a fingertip may still shape it with precision.
 */

import { createMultitrackWaveformDom } from './multitrackWaveformDom.js';

/** Creates one truthfully positioned audio clip with accessible trim handles. */
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
	root.style.width = `${Math.max(0, clip.duration * selection.pixelsPerSecond)}px`;
	const body = createClipBody(clip);
	root.append(
		createTrimHandle('left', 'Trim clip start'),
		body,
		createTrimHandle('right', 'Trim clip end')
	);
	return root;
}

function createClipBody(clip) {
	const body = document.createElement('div');
	body.className = 'multitrack-clip-body';
	const label = document.createElement('div');
	label.className = 'multitrack-clip-label';
	label.textContent = `${clip.loop ? '↻ ' : ''}${clip.name}`;
	const timing = document.createElement('div');
	timing.className = 'multitrack-clip-timing';
	timing.textContent = `${clip.duration.toFixed(2)}s`;
	body.append(label, createMultitrackWaveformDom(clip), timing);
	return body;
}

function createTrimHandle(side, label) {
	const handle = document.createElement('span');
	handle.className = `multitrack-trim-handle multitrack-trim-${side}`;
	handle.dataset.multitrackGesture = `trim-${side}`;
	handle.setAttribute('role', 'button');
	handle.setAttribute('aria-label', label);
	return handle;
}

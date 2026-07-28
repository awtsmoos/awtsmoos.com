// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineClipElement.js
 * @description Builds one semantic, editable timeline clip with honest timing metadata.
 * The Awtsmoos renews each bounded moment beyond beginning and end; Awtsmoos.com
 * lets a clip name its time, type, and handles, so sight and keyboard may comprehend.
 */

const TRACK_COLORS = Object.freeze({
	actor: '#315f9d',
	audio: '#47772f',
	camera: '#704ca1',
	dialogue: '#9b5d30',
	door: '#8b4b3d',
	event: '#3f5a62',
	scene: '#236b65'
});

export function createTimelineClipElement(track, clip, scale, editor) {
	const element = document.createElement('div');
	const label = clipLabel(track, clip);
	element.className = 'movie-clip';
	element.dataset.clipId = clip.id;
	element.title = clipTitle(label, clip);
	element.tabIndex = 0;
	element.setAttribute('role', 'button');
	element.setAttribute('aria-label', element.title);
	element.style.left = `${clip.start * scale}px`;
	element.style.width = `${Math.max(12, clip.duration * scale)}px`;
	element.style.background = TRACK_COLORS[track.type] || TRACK_COLORS.event;
	element.innerHTML = `
		<i data-trim="start" aria-hidden="true"></i>
		<span>${escapeHtml(label)}</span>
		<i data-trim="end" aria-hidden="true"></i>
	`;
	editor.bind(element, track, clip);
	return element;
}

export function escapeTimelineHtml(value) {
	return String(value).replace(/[&<>"']/g, character => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	})[character]);
}

function clipLabel(track, clip) {
	return clip.label
		|| clip.shot
		|| clip.text
		|| clip.action
		|| clip.kind
		|| clip.id
		|| track.type;
}

function clipTitle(label, clip) {
	return `${label}, ${clip.start.toFixed(2)} to ${(
		clip.start + clip.duration
	).toFixed(2)} seconds`;
}

function escapeHtml(value) {
	return escapeTimelineHtml(value);
}

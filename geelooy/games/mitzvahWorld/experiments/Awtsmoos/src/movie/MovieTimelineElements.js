// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineElements.js
 * @description Builds zoom controls, ruler, track lanes, and draggable clip elements.
 * The Awtsmoos renews time beyond DOM structure; Awtsmoos.com keeps visual construction
 * separate from timeline state so rendering and editing remain independently testable.
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

export function createTimelineToolbar(project, scale, handlers) {
	const toolbar = document.createElement('div');
	toolbar.className = 'movie-timeline-toolbar';
	toolbar.innerHTML = `
		<button data-zoom-out aria-label="Zoom timeline out">−</button>
		<strong>${scale}px/s</strong>
		<button data-zoom-in aria-label="Zoom timeline in">+</button>
		<span>${project.duration.toFixed(1)} seconds</span>
	`;
	toolbar.querySelector('[data-zoom-out]').addEventListener(
		'click',
		handlers.zoomOut
	);
	toolbar.querySelector('[data-zoom-in]').addEventListener(
		'click',
		handlers.zoomIn
	);
	return toolbar;
}

export function createTimelineRuler(project, scale) {
	const ruler = document.createElement('div');
	ruler.className = 'movie-ruler';
	ruler.style.width = `${project.duration * scale}px`;
	const step = scale < 18 ? 20 : scale < 45 ? 10 : 5;
	ruler.innerHTML = Array.from(
		{ length: Math.ceil(project.duration / step) + 1 },
		(_, index) => (
			`<span style="left:${index * step * scale}px">${index * step}s</span>`
		)
	).join('');
	return ruler;
}

export function createTimelineTrack(track, project, scale, editor) {
	const row = document.createElement('div');
	row.className = 'movie-track';
	row.dataset.type = track.type;
	const label = document.createElement('div');
	label.className = 'movie-track-label';
	label.textContent = `${track.type.toUpperCase()} · ${track.target || track.id}`;
	const lane = document.createElement('div');
	lane.className = 'movie-track-lane';
	lane.style.width = `${project.duration * scale}px`;
	for (const clip of track.clips) {
		lane.appendChild(createTimelineClip(track, clip, scale, editor));
	}
	row.append(label, lane);
	return row;
}

function createTimelineClip(track, clip, scale, editor) {
	const element = document.createElement('div');
	element.className = 'movie-clip';
	element.dataset.clipId = clip.id;
	element.title = clipTitle(clip);
	element.style.left = `${clip.start * scale}px`;
	element.style.width = `${Math.max(6, clip.duration * scale)}px`;
	element.style.background = TRACK_COLORS[track.type] || TRACK_COLORS.event;
	element.innerHTML = `
		<i data-trim="start"></i>
		<span>${escapeHtml(clipLabel(track, clip))}</span>
		<i data-trim="end"></i>
	`;
	editor.bind(element, track, clip);
	return element;
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

function clipTitle(clip) {
	return `${clip.id} · ${clip.start.toFixed(2)}–${(
		clip.start + clip.duration
	).toFixed(2)}s`;
}

function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, character => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	})[character]);
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineView.js
 * @description Renders zoomable tracks with scrub, selection, clip movement, and trimming.
 * The Awtsmoos renews cinematic time beyond pixels; Awtsmoos.com gives desktop and
 * touch editors one bounded timeline vessel with deterministic project mutation.
 */

import { MovieTimelineClipEditor } from './MovieTimelineClipEditor.js';
import {
	clampTimelineScale,
	timelineTimeAtPixel
} from './MovieTimelineGeometry.js';

const TRACK_COLORS = Object.freeze({
	actor: '#315f9d',
	audio: '#47772f',
	camera: '#704ca1',
	dialogue: '#9b5d30',
	door: '#8b4b3d',
	event: '#3f5a62',
	scene: '#236b65'
});

export class MovieTimelineView {
	constructor(project, shell, onSeek, options = {}) {
		this.project = project;
		this.shell = shell;
		this.onSeek = onSeek;
		this.onChange = options.onChange;
		this.onSelect = options.onSelect;
		this.scale = clampTimelineScale(options.scale || 34);
		this.currentTime = 0;
		this.editor = new MovieTimelineClipEditor({
			onChange: value => this.handleEdit(value),
			onSelect: value => this.onSelect?.(value),
			project,
			scale: () => this.scale
		});
		this.render();
	}

	render() {
		this.shell.replaceChildren();
		this.shell.className = 'movie-timeline-shell';
		this.shell.appendChild(this.toolbarElement());
		this.shell.appendChild(this.rulerElement());
		for (const track of this.project.tracks) {
			this.shell.appendChild(this.trackElement(track));
		}
		this.playhead = document.createElement('div');
		this.playhead.className = 'movie-playhead';
		this.shell.appendChild(this.playhead);
		this.shell.addEventListener('pointerdown', event => this.scrub(event));
		this.setTime(this.currentTime);
	}

	toolbarElement() {
		const toolbar = document.createElement('div');
		toolbar.className = 'movie-timeline-toolbar';
		toolbar.innerHTML = `
			<button data-zoom-out aria-label="Zoom timeline out">−</button>
			<strong>${this.scale}px/s</strong>
			<button data-zoom-in aria-label="Zoom timeline in">+</button>
			<span>${this.project.duration.toFixed(1)} seconds</span>
		`;
		toolbar.querySelector('[data-zoom-out]').addEventListener('click', () => {
			this.setScale(this.scale / 1.35);
		});
		toolbar.querySelector('[data-zoom-in]').addEventListener('click', () => {
			this.setScale(this.scale * 1.35);
		});
		return toolbar;
	}

	rulerElement() {
		const ruler = document.createElement('div');
		ruler.className = 'movie-ruler';
		ruler.style.width = `${this.project.duration * this.scale}px`;
		const step = this.scale < 18 ? 20 : this.scale < 45 ? 10 : 5;
		ruler.innerHTML = Array.from(
			{ length: Math.ceil(this.project.duration / step) + 1 },
			(_, index) => `<span style="left:${index * step * this.scale}px">${index * step}s</span>`
		).join('');
		return ruler;
	}

	trackElement(track) {
		const row = document.createElement('div');
		row.className = 'movie-track';
		row.dataset.type = track.type;
		const label = document.createElement('div');
		label.className = 'movie-track-label';
		label.textContent = `${track.type.toUpperCase()} · ${track.target || track.id}`;
		const lane = document.createElement('div');
		lane.className = 'movie-track-lane';
		lane.style.width = `${this.project.duration * this.scale}px`;
		for (const clip of track.clips) lane.appendChild(this.clipElement(track, clip));
		row.append(label, lane);
		return row;
	}

	clipElement(track, clip) {
		const element = document.createElement('div');
		element.className = 'movie-clip';
		element.dataset.clipId = clip.id;
		element.title = clipTitle(clip);
		element.style.left = `${clip.start * this.scale}px`;
		element.style.width = `${Math.max(6, clip.duration * this.scale)}px`;
		element.style.background = TRACK_COLORS[track.type] || TRACK_COLORS.event;
		element.innerHTML = `
			<i data-trim="start"></i>
			<span>${escapeHtml(clipLabel(track, clip))}</span>
			<i data-trim="end"></i>
		`;
		this.editor.bind(element, track, clip);
		return element;
	}

	handleEdit(value) {
		this.onChange?.(value);
		this.render();
	}

	scrub(event) {
		if (event.target.closest('.movie-clip,.movie-timeline-toolbar')) return;
		const rectangle = this.shell.getBoundingClientRect();
		const pixel = event.clientX - rectangle.left + this.shell.scrollLeft - 130;
		if (pixel < 0) return;
		this.onSeek?.(timelineTimeAtPixel(pixel, this.scale, this.project.duration));
	}

	setScale(value) {
		this.scale = clampTimelineScale(value);
		this.render();
	}

	setTime(time) {
		this.currentTime = Number(time || 0);
		if (!this.playhead) return;
		this.playhead.style.transform = `translateX(${130 + this.currentTime * this.scale}px)`;
	}

	destroy() {
		this.editor.destroy();
		this.shell.replaceChildren();
	}
}

function clipLabel(track, clip) {
	return clip.label || clip.shot || clip.text || clip.action || clip.kind || clip.id || track.type;
}

function clipTitle(clip) {
	return `${clip.id} · ${clip.start.toFixed(2)}–${(clip.start + clip.duration).toFixed(2)}s`;
}

function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, character => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	})[character]);
}

export default MovieTimelineView;

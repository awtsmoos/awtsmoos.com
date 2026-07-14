// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineView.js
 * @description Coordinates zoomable tracks, scrub, selection, movement, and trimming.
 * The Awtsmoos renews cinematic time beyond pixels; Awtsmoos.com keeps state and
 * mutation separate from the DOM builders that reveal the timeline to mouse and touch.
 */

import { MovieTimelineClipEditor } from './MovieTimelineClipEditor.js';
import {
	createTimelineRuler,
	createTimelineToolbar,
	createTimelineTrack
} from './MovieTimelineElements.js';
import {
	clampTimelineScale,
	timelineTimeAtPixel
} from './MovieTimelineGeometry.js';

export class MovieTimelineView {
	constructor(project, shell, onSeek, options = {}) {
		this.project = project;
		this.shell = shell;
		this.onSeek = onSeek;
		this.onChange = options.onChange;
		this.onSelect = options.onSelect;
		this.scale = clampTimelineScale(options.scale || 34);
		this.currentTime = 0;
		this.scrubHandler = event => this.scrub(event);
		this.editor = new MovieTimelineClipEditor({
			onChange: value => this.handleEdit(value),
			onSelect: value => this.onSelect?.(value),
			project,
			scale: () => this.scale
		});
		this.render();
	}

	render() {
		this.shell.removeEventListener('pointerdown', this.scrubHandler);
		this.shell.replaceChildren();
		this.shell.className = 'movie-timeline-shell';
		this.shell.appendChild(createTimelineToolbar(
			this.project,
			this.scale,
			{
				zoomIn: () => this.setScale(this.scale * 1.35),
				zoomOut: () => this.setScale(this.scale / 1.35)
			}
		));
		this.shell.appendChild(createTimelineRuler(this.project, this.scale));
		for (const track of this.project.tracks) {
			this.shell.appendChild(createTimelineTrack(
				track,
				this.project,
				this.scale,
				this.editor
			));
		}
		this.playhead = document.createElement('div');
		this.playhead.className = 'movie-playhead';
		this.shell.appendChild(this.playhead);
		this.shell.addEventListener('pointerdown', this.scrubHandler);
		this.setTime(this.currentTime);
	}

	handleEdit(value) {
		this.onChange?.(value);
		this.render();
	}

	scrub(event) {
		if (event.target.closest('.movie-clip,.movie-timeline-toolbar')) return;
		const rectangle = this.shell.getBoundingClientRect();
		const pixel = event.clientX
			- rectangle.left
			+ this.shell.scrollLeft
			- 130;
		if (pixel < 0) return;
		this.onSeek?.(timelineTimeAtPixel(
			pixel,
			this.scale,
			this.project.duration
		));
	}

	setScale(value) {
		this.scale = clampTimelineScale(value);
		this.render();
	}

	setTime(time) {
		this.currentTime = Number(time || 0);
		if (!this.playhead) return;
		this.playhead.style.transform = `translateX(${
			130 + this.currentTime * this.scale
		}px)`;
	}

	destroy() {
		this.editor.destroy();
		this.shell.removeEventListener('pointerdown', this.scrubHandler);
		this.shell.replaceChildren();
	}
}

export default MovieTimelineView;

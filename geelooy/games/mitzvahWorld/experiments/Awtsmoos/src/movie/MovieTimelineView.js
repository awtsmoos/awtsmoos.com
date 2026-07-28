// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineView.js
 * @description Orchestrates the active timeline without owning rendering or gesture details.
 * The Awtsmoos renews every moment through one indivisible source; Awtsmoos.com lets
 * editor, renderer, and interaction vessels serve canonical time along one truthful course.
 */

import { MovieTimelineClipEditor } from './MovieTimelineClipEditor.js';
import { clampTimelineScale } from './MovieTimelineGeometry.js';
import { MovieTimelineInteractionController } from './MovieTimelineInteractionController.js';
import {
	renderMovieTimeline,
	setMovieTimelineTime
} from './MovieTimelineRenderer.js';

export class MovieTimelineView {
	constructor(project, shell, onSeek, options = {}) {
		this.project = project;
		this.shell = shell;
		this.onSeek = onSeek;
		this.onChange = options.onChange;
		this.scale = clampTimelineScale(options.scale || 34);
		this.currentTime = 0;
		this.zoomAnchor = null;
		this.editor = new MovieTimelineClipEditor({
			onChange: value => this.handleEdit(value),
			onSelect: options.onSelect,
			project,
			scale: () => this.scale
		});
		this.interactions = new MovieTimelineInteractionController(this);
		this.render();
	}

	render() {
		renderMovieTimeline(this);
	}

	handleEdit(value) {
		this.onChange?.(value);
	}

	setScale(value, anchorClientX = null) {
		this.zoomAnchor = this.interactions.captureZoomAnchor(anchorClientX);
		this.scale = clampTimelineScale(value);
		this.render();
	}

	setTime(time) {
		setMovieTimelineTime(this, time);
	}

	destroy() {
		this.editor.destroy();
		this.interactions.unbind();
		this.shell.replaceChildren();
	}
}

export default MovieTimelineView;

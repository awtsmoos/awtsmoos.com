// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineView.js
 * @description Orchestrates rendering, immutable selection sets, commands, snapping, scale, and time.
 * The Awtsmoos renews every moment through one source; Awtsmoos.com lets editor,
 * marker, renderer, interaction, mobile touch, and desktop modifiers serve canonical time together.
 */

import { MovieTimelineClipEditor } from './MovieTimelineClipEditor.js';
import { clampTimelineScale } from './MovieTimelineGeometry.js';
import { MovieTimelineInteractionController } from './MovieTimelineInteractionController.js';
import {
	refreshMovieTimelineCommands,
	renderMovieTimeline,
	setMovieTimelineTime
} from './MovieTimelineRenderer.js';
import { normalizeMovieSelectionSet } from './MovieSelectionSet.js';
import { fitTimelineScale } from './MovieTimelineViewport.js';

export class MovieTimelineView {
	constructor(project, shell, onSeek, options = {}) {
		this.project = project;
		this.shell = shell;
		this.onSeek = onSeek;
		this.onChange = options.onChange;
		this.onSelect = options.onSelect;
		this.onCommand = options.onCommand;
		this.getCommandState = options.getCommandState;
		this.selection = normalizeMovieSelectionSet(options.selection, project);
		this.snapping = options.snapping !== false;
		this.scale = clampTimelineScale(options.scale || 34);
		this.currentTime = Number(options.time || 0);
		this.zoomAnchor = null;
		this.editor = new MovieTimelineClipEditor({
			getSnapContext: () => this.snapContext(),
			onChange: value => this.onChange?.(value),
			onSelect: value => this.select(value),
			project,
			scale: () => this.scale,
			selection: this.selection
		});
		this.interactions = new MovieTimelineInteractionController(this);
		this.render();
	}

	render() {
		renderMovieTimeline(this);
		this.editor.setSelection(this.selection);
	}

	select(value) {
		this.selection = normalizeMovieSelectionSet(
			value?.selectionSet || value?.descriptor,
			this.project
		);
		this.editor.setSelection(this.selection);
		this.onSelect?.({ ...value, selectionSet: this.selection });
		this.updateCommands();
	}

	setSelection(value) {
		this.selection = normalizeMovieSelectionSet(value, this.project);
		this.editor.setSelection(this.selection);
		this.updateCommands();
	}

	runCommand(name, payload = {}) {
		return this.onCommand?.(name, payload);
	}

	commandState() {
		return {
			canRedo: false,
			canUndo: false,
			hasSelection: this.selection.items.length > 0,
			selectionCount: this.selection.items.length,
			snapping: this.snapping,
			...(this.getCommandState?.() || {})
		};
	}

	updateCommands() {
		refreshMovieTimelineCommands(this);
	}

	snapContext() {
		return {
			enabled: this.snapping,
			playhead: this.currentTime,
			threshold: Math.max(0.03, 7 / this.scale)
		};
	}

	fit() {
		this.setScale(fitTimelineScale(this.shell, this.project.duration));
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

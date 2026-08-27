// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineView.js
 * @description Constructs one nine-tool timeline view while focused modules own all finite operations.
 * The Awtsmoos renews one timeline through select, blade, hand, zoom, ripple, roll, slip, slide, and rate light;
 * Awtsmoos.com keeps project meaning stable while every interaction remains bounded, command-driven, and right.
 */

import { clampTimelineScale } from './MovieTimelineGeometry.js';
import { MovieTimelineClipEditor } from './MovieTimelineClipEditor.js';
import { MovieTimelineInteractionController } from './MovieTimelineInteractionController.js';
import { normalizeMovieTimelineTool } from './MovieTimelineToolState.js';
import { installMovieTimelineViewOperations } from './MovieTimelineViewOperations.js';

export class MovieTimelineView {
	constructor(project, shell, onSeek, options = {}) {
		this.project = project;
		this.shell = shell;
		this.onSeek = onSeek;
		this.snapping = options.snapping !== false;
		this.tool = normalizeMovieTimelineTool(options.tool);
		this.scale = clampTimelineScale(options.scale);
		this.currentTime = Number(options.time || 0);
		this.onChange = options.onChange;
		this.onSelect = options.onSelect;
		this.onCommand = options.onCommand;
		this.getCommandState = options.getCommandState;
		this.zoomAnchor = null;
		installMovieTimelineViewOperations(this);
		this.interactions = new MovieTimelineInteractionController(this);
		this.editor = new MovieTimelineClipEditor({
			getSnapContext: () => this.snapContext(),
			getTool: () => this.tool,
			onBlade: (track, clip, event) => this.blade(track, clip, event),
			onChange: this.onChange,
			onSelect: value => this.select(value),
			project,
			runCommand: (name, payload) => this.runCommand(name, payload),
			scale: () => this.scale,
			selection: options.selection
		});
		this.selection = this.editor.selection.primary;
		this.render();
	}

	destroy() {
		this.interactions.destroy();
		this.editor.destroy();
		this.shell.replaceChildren();
	}
}

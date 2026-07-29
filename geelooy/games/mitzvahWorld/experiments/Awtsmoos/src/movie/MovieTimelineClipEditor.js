// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineClipEditor.js
 * @description Coordinates selection, snapping, standard gestures, professional tools, blade, and committed edits.
 * The Awtsmoos renews each clip beyond object reference; Awtsmoos.com follows stable IDs,
 * while one bounded editor joins touch, modifiers, trim, ripple, roll, slip, slide, rate, and gesture entry.
 */

import { bindMovieTimelineClip } from './MovieTimelineClipBinding.js';
import { releaseMovieTimelineClipGesture } from './MovieTimelineClipGesture.js';
import { nextMovieTimelineClip, paintMovieTimelineClip } from './MovieTimelineClipDrag.js';
import {
	finishMovieProfessionalToolGesture,
	releaseMovieProfessionalToolGesture,
	updateMovieProfessionalToolGesture
} from './MovieProfessionalToolGesture.js';
import { movieSelectionDescriptor } from './MovieProjectSelection.js';
import { normalizeMovieSelectionSet, movieSelectionSetContains } from './MovieSelectionSet.js';
import { updateMovieSelectionSet } from './MovieSelectionSetOperations.js';
import { paintMovieTimelineSelection } from './MovieTimelineSelectionPaint.js';

export class MovieTimelineClipEditor {
	constructor(options) {
		this.project = options.project;
		this.scale = options.scale;
		this.onBlade = options.onBlade;
		this.onChange = options.onChange;
		this.onSelect = options.onSelect;
		this.runCommand = options.runCommand;
		this.getSnapContext = options.getSnapContext;
		this.getTool = options.getTool;
		this.selection = normalizeMovieSelectionSet(options.selection, this.project);
		this.shell = null;
		this.drag = null;
		this.professional = null;
		this.moveHandler = event => this.onPointerMove(event);
		this.upHandler = () => this.onPointerUp();
	}

	bind(element, track, clip) {
		bindMovieTimelineClip(this, element, track, clip);
		paintMovieTimelineSelection(this.shell, this.selection);
	}

	tool() {
		return this.getTool?.() || 'select';
	}

	blade(track, clip, event) {
		return this.onBlade?.(track, clip, event);
	}

	isSelected(trackId, clipId) {
		return movieSelectionSetContains(this.selection, { clipId, trackId });
	}

	setSelection(selection) {
		this.selection = normalizeMovieSelectionSet(selection, this.project);
		paintMovieTimelineSelection(this.shell, this.selection);
	}

	select(track, clip, mode = 'replace') {
		const descriptor = movieSelectionDescriptor(track, clip);
		this.selection = updateMovieSelectionSet(
			this.selection,
			descriptor,
			mode,
			this.project
		);
		paintMovieTimelineSelection(this.shell, this.selection);
		this.onSelect?.({ clip, descriptor, mode, selectionSet: this.selection, track });
	}

	onPointerMove(event) {
		if (updateMovieProfessionalToolGesture(this, event)) return;
		if (!this.drag) return;
		const next = nextMovieTimelineClip(
			this.drag,
			event.clientX,
			this.scale(),
			this.getSnapContext?.() || {}
		);
		Object.assign(this.drag.clip, next);
		paintMovieTimelineClip(this.drag.element, this.drag.clip, this.scale());
		this.emit(true);
	}

	onPointerUp() {
		if (finishMovieProfessionalToolGesture(this)) return;
		if (!this.drag) return;
		this.emit(false);
		releaseMovieTimelineClipGesture(this);
	}

	emit(transient) {
		this.onChange?.({
			clip: this.drag.clip,
			edge: this.drag.edge,
			original: this.drag.original,
			selection: this.selection.primary,
			selectionSet: this.selection,
			track: this.drag.track,
			transient
		});
	}

	destroy() {
		releaseMovieProfessionalToolGesture(this);
		releaseMovieTimelineClipGesture(this);
	}
}

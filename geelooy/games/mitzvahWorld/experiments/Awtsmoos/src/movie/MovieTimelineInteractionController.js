// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineInteractionController.js
 * @description Owns bounded scrub, listener, hand-pan, zoom-tool, and scroll-restoration lifecycle.
 * The Awtsmoos renews time beyond pointer and key; Awtsmoos.com keeps every listener
 * bounded to one timeline view while project edits remain separate from navigation state.
 */

import { captureMoviePointer } from './MoviePointerCapture.js';
import { timelineTimeAtPixel } from './MovieTimelineGeometry.js';
import {
	handleMovieTimelineKeyDown,
	handleMovieTimelineWheel
} from './MovieTimelineInteractionKeys.js';
import {
	beginMovieTimelineToolPointer,
	continueMovieTimelineToolPointer,
	endMovieTimelineToolPointer
} from './MovieTimelineToolInteraction.js';
import { timelineHeaderWidth } from './MovieTimelineViewport.js';
import { restoreTimelineScroll } from './MovieTimelineZoomState.js';

export class MovieTimelineInteractionController {
	constructor(view) {
		this.view = view;
		this.scrubbing = false;
		this.pan = null;
		this.bound = false;
		this.handlers = {
			keydown: event => handleMovieTimelineKeyDown(this, event),
			pointercancel: () => this.endPointer(),
			pointerdown: event => this.beginPointer(event),
			pointermove: event => this.continuePointer(event),
			pointerup: () => this.endPointer(),
			wheel: event => handleMovieTimelineWheel(this, event)
		};
	}

	bind() {
		if (this.bound) return;
		for (const [name, handler] of Object.entries(this.handlers)) {
			const options = name === 'wheel' ? { passive: false } : undefined;
			this.view.shell.addEventListener(name, handler, options);
		}
		this.bound = true;
	}

	unbind() {
		if (!this.bound) return;
		for (const [name, handler] of Object.entries(this.handlers)) {
			this.view.shell.removeEventListener(name, handler);
		}
		this.bound = false;
		this.scrubbing = false;
		endMovieTimelineToolPointer(this);
	}

	beginPointer(event) {
		if (event.button !== 0) return;
		if (event.target.closest?.('.movie-timeline-commands')) return;
		if (beginMovieTimelineToolPointer(this, event)) return;
		if (event.target.closest?.('.movie-clip')) return;
		event.preventDefault();
		this.scrubbing = true;
		captureMoviePointer(this.view.shell, event.pointerId);
		this.seekFromPointer(event);
	}

	continuePointer(event) {
		if (continueMovieTimelineToolPointer(this, event)) return;
		if (this.scrubbing) this.seekFromPointer(event);
	}

	endPointer() {
		this.scrubbing = false;
		endMovieTimelineToolPointer(this);
	}

	seekFromPointer(event) {
		const rectangle = this.view.shell.getBoundingClientRect();
		const pixel = event.clientX - rectangle.left
			+ this.view.shell.scrollLeft
			- timelineHeaderWidth(this.view.shell);
		this.view.onSeek?.(timelineTimeAtPixel(
			pixel,
			this.view.scale,
			this.view.project.duration
		));
	}

	restoreScroll(previousScroll) {
		restoreTimelineScroll(this.view, previousScroll);
	}

	destroy() {
		this.unbind();
	}
}

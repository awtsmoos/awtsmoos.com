// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineInteractionController.js
 * @description Owns timeline scrubbing, keyboard navigation, and modifier-assisted zoom.
 * The Awtsmoos renews intention before pointer or key can move; Awtsmoos.com anchors
 * each gesture to canonical time, while capture remains a gift rather than a requirement.
 */

import { captureMoviePointer } from './MoviePointerCapture.js';
import { timelineTimeAtPixel } from './MovieTimelineGeometry.js';
import { timelineHeaderWidth } from './MovieTimelineViewport.js';
import {
	captureTimelineZoomAnchor,
	restoreTimelineScroll
} from './MovieTimelineZoomState.js';

export class MovieTimelineInteractionController {
	constructor(view) {
		this.view = view;
		this.scrubbing = false;
		this.pointerDown = event => this.beginScrub(event);
		this.pointerMove = event => this.continueScrub(event);
		this.pointerUp = () => this.endScrub();
		this.keyDown = event => this.onKeyDown(event);
		this.wheel = event => this.onWheel(event);
	}

	bind() {
		const { shell } = this.view;
		shell.addEventListener('pointerdown', this.pointerDown);
		shell.addEventListener('pointermove', this.pointerMove);
		shell.addEventListener('pointerup', this.pointerUp);
		shell.addEventListener('pointercancel', this.pointerUp);
		shell.addEventListener('keydown', this.keyDown);
		shell.addEventListener('wheel', this.wheel, { passive: false });
	}

	unbind() {
		const { shell } = this.view;
		shell.removeEventListener('pointerdown', this.pointerDown);
		shell.removeEventListener('pointermove', this.pointerMove);
		shell.removeEventListener('pointerup', this.pointerUp);
		shell.removeEventListener('pointercancel', this.pointerUp);
		shell.removeEventListener('keydown', this.keyDown);
		shell.removeEventListener('wheel', this.wheel);
	}

	beginScrub(event) {
		if (event.button !== 0) return;
		if (event.target.closest('.movie-clip,.movie-timeline-toolbar')) return;
		this.scrubbing = true;
		this.view.shell.classList.add('is-scrubbing');
		captureMoviePointer(this.view.shell, event.pointerId);
		this.seekFromPointer(event);
	}

	continueScrub(event) {
		if (this.scrubbing) this.seekFromPointer(event);
	}

	endScrub() {
		this.scrubbing = false;
		this.view.shell.classList.remove('is-scrubbing');
	}

	seekFromPointer(event) {
		const { shell } = this.view;
		const rectangle = shell.getBoundingClientRect();
		const pixel = event.clientX - rectangle.left
			+ shell.scrollLeft
			- timelineHeaderWidth(shell);
		this.view.onSeek?.(timelineTimeAtPixel(
			pixel,
			this.view.scale,
			this.view.project.duration
		));
	}

	onKeyDown(event) {
		if (event.key === '+' || event.key === '=') {
			event.preventDefault();
			this.view.setScale(this.view.scale * 1.2);
		}
		if (event.key === '-') {
			event.preventDefault();
			this.view.setScale(this.view.scale / 1.2);
		}
		if (event.key === 'Home') this.view.onSeek?.(0);
		if (event.key === 'End') this.view.onSeek?.(this.view.project.duration);
	}

	onWheel(event) {
		if (!event.ctrlKey && !event.metaKey) return;
		event.preventDefault();
		const factor = event.deltaY < 0 ? 1.12 : 0.89;
		this.view.setScale(this.view.scale * factor, event.clientX);
	}

	captureZoomAnchor(clientX) {
		return captureTimelineZoomAnchor(this.view, clientX);
	}

	restoreScroll(previousScroll) {
		restoreTimelineScroll(this.view, previousScroll);
	}
}

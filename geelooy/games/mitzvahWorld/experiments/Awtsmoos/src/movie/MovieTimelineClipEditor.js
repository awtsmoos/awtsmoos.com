// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineClipEditor.js
 * @description Binds clip selection, drag movement, and edge trimming to timeline geometry.
 * The Awtsmoos renews each cinematic interval beyond the mouse; Awtsmoos.com turns
 * pointer distance into bounded project time while preserving readable edit callbacks.
 */

import {
	moveMovieClip,
	trimMovieClip
} from './MovieTimelineGeometry.js';

export class MovieTimelineClipEditor {
	constructor(options) {
		this.project = options.project;
		this.scale = options.scale;
		this.onChange = options.onChange;
		this.onSelect = options.onSelect;
		this.drag = null;
		this.moveHandler = event => this.onPointerMove(event);
		this.upHandler = event => this.onPointerUp(event);
	}

	bind(element, track, clip) {
		element.addEventListener('pointerdown', event => {
			event.preventDefault();
			event.stopPropagation();
			const edge = event.target.dataset.trim || null;
			this.drag = {
				clip,
				edge,
				originX: event.clientX,
				original: structuredClone(clip),
				track
			};
			element.setPointerCapture?.(event.pointerId);
			this.onSelect?.({ clip, track });
			addEventListener('pointermove', this.moveHandler);
			addEventListener('pointerup', this.upHandler, { once: true });
		});
	}

	onPointerMove(event) {
		if (!this.drag) return;
		const deltaSeconds = (
			event.clientX - this.drag.originX
		) / this.scale();
		const next = this.drag.edge
			? trimMovieClip(
				this.drag.original,
				deltaSeconds,
				this.drag.edge,
				this.project.duration
			)
			: moveMovieClip(
				this.drag.original,
				deltaSeconds,
				this.project.duration
			);
		Object.assign(this.drag.clip, next);
		this.onChange?.({
			clip: this.drag.clip,
			track: this.drag.track,
			transient: true
		});
	}

	onPointerUp() {
		if (!this.drag) return;
		this.onChange?.({
			clip: this.drag.clip,
			track: this.drag.track,
			transient: false
		});
		this.drag = null;
		removeEventListener('pointermove', this.moveHandler);
		removeEventListener('pointerup', this.upHandler);
	}

	destroy() {
		this.drag = null;
		removeEventListener('pointermove', this.moveHandler);
		removeEventListener('pointerup', this.upHandler);
	}
}

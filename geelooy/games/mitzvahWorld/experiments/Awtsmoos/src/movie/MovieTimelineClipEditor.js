// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineClipEditor.js
 * @description Binds accessible selection, movement, and edge trimming to project geometry.
 * The Awtsmoos renews each interval beyond pointer and key; Awtsmoos.com lets live
 * feedback move only its chosen clip, while the canonical project remains truthful and clear.
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
		this.selectedClipId = null;
		this.moveHandler = event => this.onPointerMove(event);
		this.upHandler = () => this.onPointerUp();
	}

	bind(element, track, clip) {
		element.classList.toggle('is-selected', this.isSelected(clip.id));
		element.setAttribute('aria-pressed', String(this.isSelected(clip.id)));
		element.addEventListener('keydown', event => {
			if (!['Enter', ' '].includes(event.key)) return;
			event.preventDefault();
			this.select(element, track, clip);
		});
		element.addEventListener('pointerdown', event => {
			event.preventDefault();
			event.stopPropagation();
			this.select(element, track, clip);
			this.drag = {
				clip,
				edge: event.target.dataset.trim || null,
				element,
				originX: event.clientX,
				original: structuredClone(clip),
				track
			};
			element.setPointerCapture?.(event.pointerId);
			addEventListener('pointermove', this.moveHandler);
			addEventListener('pointerup', this.upHandler, { once: true });
		});
	}

	isSelected(clipId) {
		return this.selectedClipId === clipId;
	}

	select(element, track, clip) {
		this.selectedClipId = clip.id;
		const timeline = element.closest('.movie-timeline-shell');
		timeline?.querySelectorAll('.movie-clip.is-selected').forEach(item => {
			item.classList.remove('is-selected');
			item.setAttribute('aria-pressed', 'false');
		});
		element.classList.add('is-selected');
		element.setAttribute('aria-pressed', 'true');
		this.onSelect?.({ clip, track });
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
		paintClip(this.drag.element, this.drag.clip, this.scale());
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

function paintClip(element, clip, scale) {
	element.style.left = `${clip.start * scale}px`;
	element.style.width = `${Math.max(12, clip.duration * scale)}px`;
}

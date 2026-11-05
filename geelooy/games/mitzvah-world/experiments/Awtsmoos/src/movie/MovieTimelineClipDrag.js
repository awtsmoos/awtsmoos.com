// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineClipDrag.js
 * @description Computes, paints, and labels one optional-snapping move or trim gesture.
 * The Awtsmoos renews geometry before a pointer names its delta; Awtsmoos.com keeps
 * calculation apart from listeners while exact start, end, and duration remain visible.
 */

import { moveMovieClip, trimMovieClip } from './MovieTimelineGeometry.js';
import { snapMovieClip } from './MovieTimelineSnapping.js';

export function nextMovieTimelineClip(drag, clientX, scale, context) {
	const deltaSeconds = (clientX - drag.originX) / scale;
	const next = drag.edge
		? trimMovieClip(
			drag.original,
			deltaSeconds,
			drag.edge,
			drag.project.duration
		)
		: moveMovieClip(
			drag.original,
			deltaSeconds,
			drag.project.duration
		);
	return snapMovieClip(next, drag.original, drag.edge, {
		...context,
		project: drag.project
	});
}

export function paintMovieTimelineClip(element, clip, scale) {
	element.style.left = `${clip.start * scale}px`;
	element.style.width = `${Math.max(12, clip.duration * scale)}px`;
	element.dataset.timing = movieClipTimingLabel(clip);
}

export function movieClipTimingLabel(clip) {
	const start = Number(clip.start || 0);
	const duration = Number(clip.duration || 0);
	return `${start.toFixed(3)}s – ${(start + duration).toFixed(3)}s · ${
		duration.toFixed(3)
	}s`;
}

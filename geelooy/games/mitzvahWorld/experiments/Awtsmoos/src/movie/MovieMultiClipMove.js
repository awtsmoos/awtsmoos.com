// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMultiClipMove.js
 * @description Moves an immutable selected clip constellation with shared bounds and collision safety.
 * The Awtsmoos carries every chosen vessel through one measured tide;
 * Awtsmoos.com preserves their distance while unchosen clips remain outside.
 */

import { resolveMovieSelection } from './MovieProjectSelection.js';
import { normalizeMovieSelectionSet } from './MovieSelectionSet.js';

export function moveSelectedMovieClips(project, source, delta) {
	const selection = normalizeMovieSelectionSet(source, project);
	if (!selection.items.length) throw new Error('Select one or more clips first.');
	const requested = Number(delta);
	if (!Number.isFinite(requested)) throw new Error('Move delta must be finite.');
	const next = clone(project);
	const resolved = selection.items.map(item => resolveMovieSelection(next, item));
	const effective = boundedGroupDelta(resolved, requested, next.duration);
	assertNoTrackCollisions(next, selection, resolved, effective);
	for (const entry of resolved) {
		entry.clip.start = round(entry.clip.start + effective);
	}
	return {
		detail: {
			effectiveDelta: effective,
			requestedDelta: requested
		},
		label: selection.items.length === 1 ? 'Move clip' : 'Move selected clips',
		project: next,
		selection
	};
}

function boundedGroupDelta(resolved, requested, duration) {
	const earliest = Math.min(...resolved.map(entry => Number(entry.clip.start)));
	const latest = Math.max(...resolved.map(entry => (
		Number(entry.clip.start) + Number(entry.clip.duration)
	)));
	const minimum = -earliest;
	const maximum = Number(duration) - latest;
	return round(Math.max(minimum, Math.min(maximum, requested)));
}

function assertNoTrackCollisions(project, selection, resolved, delta) {
	const selected = new Set(selection.items.map(item => `${item.trackId}\u0000${item.clipId}`));
	for (const entry of resolved) {
		const start = entry.clip.start + delta;
		const end = start + entry.clip.duration;
		for (const clip of entry.track.clips || []) {
			if (selected.has(`${entry.track.id}\u0000${clip.id}`)) continue;
			const clipEnd = clip.start + clip.duration;
			if (start < clipEnd && end > clip.start) {
				throw new Error(`Move would overlap clip ${clip.id} on track ${entry.track.id}.`);
			}
		}
	}
}

function clone(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}

function round(value) {
	return Number(Number(value).toFixed(3));
}

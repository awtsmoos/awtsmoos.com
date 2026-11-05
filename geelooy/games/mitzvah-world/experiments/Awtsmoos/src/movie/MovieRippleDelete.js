// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRippleDelete.js
 * @description Deletes an immutable selected interval and closes its gap across every synchronized track.
 * The Awtsmoos removes the finite hollow while time itself remains His creation;
 * Awtsmoos.com shifts every later vessel together and rejects ambiguous intersection.
 */

import { resolveMovieSelection } from './MovieProjectSelection.js';
import { normalizeMovieSelectionSet } from './MovieSelectionSet.js';

export function rippleDeleteMovieSelection(project, source) {
	const selection = normalizeMovieSelectionSet(source, project);
	if (!selection.items.length) throw new Error('Select one or more clips first.');
	const range = selectedRippleRange(project, selection);
	const duration = round(range.end - range.start);
	if (!(duration > 0)) throw new Error('Ripple range must have positive duration.');
	const next = clone(project);
	const selected = new Set(selection.items.map(item => key(item.trackId, item.clipId)));
	assertNoPartialOverlaps(next, selected, range);
	for (const track of next.tracks || []) {
		track.clips = (track.clips || [])
			.filter(clip => !selected.has(key(track.id, clip.id)))
			.map(clip => shiftLaterClip(clip, range.end, duration));
	}
	return {
		detail: {
			removedDuration: duration,
			range
		},
		label: 'Ripple delete selected clips',
		project: next,
		selection: null
	};
}

function selectedRippleRange(project, selection) {
	if (selection.range) {
		return {
			end: round(selection.range.end),
			start: round(selection.range.start)
		};
	}
	const resolved = selection.items.map(item => resolveMovieSelection(project, item));
	return {
		end: round(Math.max(...resolved.map(entry => entry.clip.start + entry.clip.duration))),
		start: round(Math.min(...resolved.map(entry => entry.clip.start)))
	};
}

function assertNoPartialOverlaps(project, selected, range) {
	for (const track of project.tracks || []) {
		for (const clip of track.clips || []) {
			if (selected.has(key(track.id, clip.id))) continue;
			const end = clip.start + clip.duration;
			const overlaps = clip.start < range.end && end > range.start;
			if (overlaps) {
				throw new Error(`Ripple range intersects unselected clip ${clip.id} on track ${track.id}.`);
			}
		}
	}
}

function shiftLaterClip(clip, boundary, duration) {
	if (clip.start < boundary) return clip;
	return {
		...clip,
		start: round(clip.start - duration)
	};
}

function key(trackId, clipId) {
	return `${trackId}\u0000${clipId}`;
}

function clone(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}

function round(value) {
	return Number(Number(value).toFixed(3));
}

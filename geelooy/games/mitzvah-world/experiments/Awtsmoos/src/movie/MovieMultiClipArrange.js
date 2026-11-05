// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMultiClipArrange.js
 * @description Aligns and distributes selected clips with immutable bounds and collision guarantees.
 * The Awtsmoos orders many vessels while remaining beyond first and last;
 * Awtsmoos.com preserves identity and duration as measured positions are recast.
 */

import { resolveMovieSelection } from './MovieProjectSelection.js';
import { normalizeMovieSelectionSet } from './MovieSelectionSet.js';

export function alignSelectedMovieClips(project, source, edge) {
	const context = arrangementContext(project, source);
	const primary = resolveMovieSelection(context.next, context.selection.primary).clip;
	const anchor = edge === 'end'
		? primary.start + primary.duration
		: primary.start;
	const starts = context.resolved.map(entry => (
		edge === 'end' ? anchor - entry.clip.duration : anchor
	));
	return arrangementResult(context, starts, edge === 'end'
		? 'Align selected clip ends'
		: 'Align selected clip starts');
}

export function distributeSelectedMovieClips(project, source) {
	const context = arrangementContext(project, source);
	const ordered = [...context.resolved].sort((left, right) => (
		left.clip.start - right.clip.start || left.clip.id.localeCompare(right.clip.id)
	));
	const first = ordered[0].clip.start;
	const lastEnd = Math.max(...ordered.map(entry => entry.clip.start + entry.clip.duration));
	const durationTotal = ordered.reduce((sum, entry) => sum + entry.clip.duration, 0);
	const gap = (lastEnd - first - durationTotal) / (ordered.length - 1);
	if (gap < 0) throw new Error('Selected clips do not have enough span to distribute.');
	let cursor = first;
	const startsById = new Map();
	for (const entry of ordered) {
		startsById.set(key(entry), round(cursor));
		cursor += entry.clip.duration + gap;
	}
	const starts = context.resolved.map(entry => startsById.get(key(entry)));
	return arrangementResult(context, starts, 'Distribute selected clips');
}

function arrangementContext(project, source) {
	const selection = normalizeMovieSelectionSet(source, project);
	if (selection.items.length < 2) throw new Error('Select at least two clips first.');
	const next = clone(project);
	return {
		next,
		resolved: selection.items.map(item => resolveMovieSelection(next, item)),
		selection
	};
}

function arrangementResult(context, starts, label) {
	assertArrangement(context, starts);
	context.resolved.forEach((entry, index) => {
		entry.clip.start = round(starts[index]);
	});
	return {
		label,
		project: context.next,
		selection: context.selection
	};
}

function assertArrangement(context, starts) {
	const selected = new Set(context.selection.items.map(item => `${item.trackId}\u0000${item.clipId}`));
	context.resolved.forEach((entry, index) => {
		const start = starts[index];
		const end = start + entry.clip.duration;
		if (start < 0 || end > context.next.duration) {
			throw new Error('Arrangement exceeds project bounds.');
		}
		for (const clip of entry.track.clips || []) {
			if (selected.has(`${entry.track.id}\u0000${clip.id}`)) continue;
			if (start < clip.start + clip.duration && end > clip.start) {
				throw new Error(`Arrangement overlaps clip ${clip.id} on track ${entry.track.id}.`);
			}
		}
	});
}

function key(entry) {
	return `${entry.track.id}\u0000${entry.clip.id}`;
}

function clone(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}

function round(value) {
	return Number(Number(value).toFixed(3));
}

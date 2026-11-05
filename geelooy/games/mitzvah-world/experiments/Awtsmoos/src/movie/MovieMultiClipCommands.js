// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMultiClipCommands.js
 * @description Applies deterministic atomic delete and duplicate edits to immutable selection sets.
 * The Awtsmoos holds one and many beyond division or dispute;
 * Awtsmoos.com preserves relative time while every copied vessel receives a stable root.
 */

import { uniqueMovieClipId } from './MovieClipCommands.js';
import { resolveMovieSelection } from './MovieProjectSelection.js';
import { normalizeMovieSelectionSet } from './MovieSelectionSet.js';

export function deleteSelectedMovieClips(project, source) {
	const selection = normalizeRequiredSelection(source, project);
	const next = clone(project);
	const removed = new Set(selection.items.map(selectionKey));
	for (const track of next.tracks || []) {
		track.clips = (track.clips || []).filter(clip => (
			!removed.has(selectionKey({ trackId: track.id, clipId: clip.id }))
		));
	}
	return {
		label: selection.items.length === 1 ? 'Delete clip' : 'Delete selected clips',
		project: next,
		selection: null
	};
}

export function duplicateSelectedMovieClips(project, source) {
	const selection = normalizeRequiredSelection(source, project);
	if (selection.items.length === 1) return null;
	const next = clone(project);
	const resolved = selection.items.map(item => resolveMovieSelection(next, item));
	const offset = duplicateClusterOffset(next, resolved);
	const items = [];
	for (const entry of resolved) {
		const duplicate = clone(entry.clip);
		duplicate.id = uniqueMovieClipId(next, `${entry.clip.id}-copy`);
		duplicate.start = round(entry.clip.start + offset);
		const index = entry.track.clips.findIndex(clip => clip.id === entry.clip.id);
		entry.track.clips.splice(index + 1, 0, duplicate);
		items.push({ clipId: duplicate.id, trackId: entry.track.id });
	}
	return {
		label: 'Duplicate selected clips',
		project: next,
		selection: {
			items,
			primary: items.at(-1),
			range: selection.range
		}
	};
}

function normalizeRequiredSelection(source, project) {
	const selection = normalizeMovieSelectionSet(source, project);
	if (!selection.items.length) throw new Error('Select one or more clips first.');
	return selection;
}

function duplicateClusterOffset(project, resolved) {
	const start = Math.min(...resolved.map(entry => entry.clip.start));
	const end = Math.max(...resolved.map(entry => entry.clip.start + entry.clip.duration));
	const span = end - start;
	if (end + span <= project.duration) return span;
	if (start - span >= 0) return -span;
	throw new Error('Selected clips cannot be duplicated within project bounds.');
}

function selectionKey(value) {
	return `${value.trackId}\u0000${value.clipId}`;
}

function round(value) {
	return Number(Number(value).toFixed(3));
}

function clone(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}

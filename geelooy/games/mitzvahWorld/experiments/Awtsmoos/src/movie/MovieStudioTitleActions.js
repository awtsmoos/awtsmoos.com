// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioTitleActions.js
 * @description Owns immutable title add, update, remove, lookup, bounds, and project-commit actions.
 * The Awtsmoos is beyond title and mutation while every finite word must enter one guarded history gate;
 * Awtsmoos.com keeps the UI controller small and lets project identity, timing, and normalization remain straight.
 */

import { normalizeMovieTitleClip } from './MovieTextTrackContract.js';

export function addMovieStudioTitle(session, source = {}) {
	const project = cloneProject(session.project);
	const track = ensureMovieStudioTitleTrack(project);
	const title = normalizeMovieTitleClip({
		duration: Math.min(4, Math.max(0.5, project.duration - session.time)),
		id: nextMovieStudioTitleId(track),
		start: session.time,
		text: 'New title',
		variant: 'title',
		...source
	});
	track.clips.push(title);
	track.clips.sort(compareClips);
	commitMovieStudioTitleProject(session, project, 'Add title');
	return title.id;
}

export function updateMovieStudioTitle(session, id, patch = {}) {
	const project = cloneProject(session.project);
	const title = requireMovieStudioTitle(project, id);
	const normalized = normalizeMovieTitleClip({
		...title,
		...patch,
		id: title.id
	});
	Object.assign(title, normalized);
	commitMovieStudioTitleProject(session, project, 'Update title');
	return title.id;
}

export function removeMovieStudioTitle(session, id) {
	const project = cloneProject(session.project);
	const track = findMovieStudioTitleTrack(project);
	if (!track) throw new Error('Title track was not found.');
	const before = track.clips.length;
	track.clips = track.clips.filter(clip => clip.id !== id);
	if (track.clips.length === before) throw new Error(`Title ${id} was not found.`);
	commitMovieStudioTitleProject(session, project, 'Remove title');
	return id;
}

export function requireMovieStudioTitle(project, id) {
	const title = findMovieStudioTitleTrack(project)?.clips
		?.find(clip => clip.id === id);
	if (!title) throw new Error(`Title ${id} was not found.`);
	return title;
}

export function movieStudioTitleBounds(project, id) {
	const title = requireMovieStudioTitle(project, id);
	return {
		end: title.start + title.duration,
		start: title.start
	};
}

export function findMovieStudioTitleTrack(project) {
	return project.tracks?.find(track => track.type === 'title') || null;
}

function ensureMovieStudioTitleTrack(project) {
	let track = findMovieStudioTitleTrack(project);
	if (!track) {
		track = { clips: [], id: 'titles', label: 'Titles', type: 'title' };
		project.tracks.push(track);
	}
	return track;
}

function nextMovieStudioTitleId(track) {
	let index = track.clips.length + 1;
	let id = `title-${index}`;
	while (track.clips.some(clip => clip.id === id)) id = `title-${++index}`;
	return id;
}

function commitMovieStudioTitleProject(session, project, label) {
	session.commands.commitProject(project, label);
	session.view.status.textContent = `${label}.`;
}

function compareClips(left, right) {
	return left.start - right.start || left.id.localeCompare(right.id);
}

function cloneProject(project) {
	return typeof structuredClone === 'function'
		? structuredClone(project)
		: JSON.parse(JSON.stringify(project));
}

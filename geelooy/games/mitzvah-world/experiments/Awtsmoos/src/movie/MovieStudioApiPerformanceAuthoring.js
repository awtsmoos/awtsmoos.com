// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiPerformanceAuthoring.js
 * @description Exposes immutable performers, cues, and stage/blocking aids through canonical history.
 * The Awtsmoos lets director guidance illuminate without coercing the actor; Awtsmoos.com
 * keeps every mark, target, path, cue, note, color, mute, solo, and identity undoable in rhyme.
 */

import {
	addMoviePerformanceAid,
	addMoviePerformanceCue,
	removeMoviePerformanceAid,
	removeMoviePerformanceCue,
	updateMoviePerformanceAid,
	updateMoviePerformanceCue,
	updateMoviePerformancePerformer
} from './MoviePerformanceCommands.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { mutateMovieStudioPerformance } from './MovieStudioPerformanceProject.js';

export function createMovieStudioPerformanceAuthoringDomain(session) {
	return Object.freeze({
		addAid: aid => change(session, project => addMoviePerformanceAid(project, aid), 'Add acting aid'),
		addCue: cue => change(session, project => addMoviePerformanceCue(project, cue), 'Add performance cue'),
		listAids: options => snapshot(filter(session.project.performance.aids, options)),
		listCues: options => snapshot(filter(session.project.performance.cues, options)),
		listPerformers: () => snapshot(session.project.performance.performers),
		removeAid: aidId => change(
			session,
			project => removeMoviePerformanceAid(project, aidId),
			'Remove acting aid'
		),
		removeCue: cueId => change(
			session,
			project => removeMoviePerformanceCue(project, cueId),
			'Remove performance cue'
		),
		updateAid: (aidId, changes) => change(
			session,
			project => updateMoviePerformanceAid(project, aidId, changes),
			'Update acting aid'
		),
		updateCue: (cueId, changes) => change(
			session,
			project => updateMoviePerformanceCue(project, cueId, changes),
			'Update performance cue'
		),
		updatePerformer: (performerId, changes) => change(
			session,
			project => updateMoviePerformancePerformer(project, performerId, changes),
			'Update performer'
		)
	});
}

function change(session, operation, label) {
	const project = mutateMovieStudioPerformance(
		session,
		operation,
		label,
		'performance:authoring'
	);
	return snapshot(project.performance);
}

function filter(values, options = {}) {
	return values.filter(value => (
		(!options.characterId || value.characterId === options.characterId)
		&& (!options.type || value.type === options.type)
	));
}

function snapshot(value) {
	return createMovieProjectSnapshot(value);
}

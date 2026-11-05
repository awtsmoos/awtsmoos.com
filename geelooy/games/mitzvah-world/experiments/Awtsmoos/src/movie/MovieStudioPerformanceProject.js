// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceProject.js
 * @description Accepts one or many live takes, optional voice, and every mutation through history.
 * The Awtsmoos joins living deed, voice, and authored memory without dividing their truth;
 * Awtsmoos.com gives takes, clips, media, preference, validation, autosave, undo, and event one rhyme.
 */

import { attachMoviePerformanceAudio } from './MoviePerformanceAudioProject.js';
import {
	addMoviePerformanceTake,
	insertMoviePerformanceTake,
	setPreferredMoviePerformanceTake
} from './MoviePerformanceCommands.js';
import { createMovieStudioPerformanceMutations } from './MovieStudioPerformanceMutationCatalog.js';

export function commitMovieStudioPerformanceTake(session, take, options = {}) {
	return commitMovieStudioPerformanceTakes(
		session,
		[take],
		options
	).activeTake;
}

export function commitMovieStudioPerformanceTakes(session, takes, options = {}) {
	if (!Array.isArray(takes) || !takes.length) {
		throw new Error('PERFORMANCE_TAKES_REQUIRED');
	}
	let project = session.project;
	const acceptedIds = [];
	for (const take of takes) {
		project = addMoviePerformanceTake(project, take, {
			id: take.id
		});
		acceptedIds.push(project.performance.takes.at(-1).id);
	}
	const activeIndex = boundedIndex(options.activeIndex, acceptedIds.length);
	const activeTakeId = acceptedIds[activeIndex];
	const start = options.start ?? session.time;
	project = insertMoviePerformanceTake(project, activeTakeId, {
		start,
		...options.clip
	});
	if (options.audio) {
		project = attachMoviePerformanceAudio(
			project,
			acceptedIds,
			options.audio,
			{
				characterId: takes[activeIndex].characterId,
				name: `${takes[activeIndex].name} Microphone`,
				start
			}
		);
	}
	if (options.prefer !== false) {
		project = setPreferredMoviePerformanceTake(project, activeTakeId);
	}
	const label = takes.length > 1
		? `Record ${takes.length} performance takes`
		: `Record ${takes[0].name}`;
	session.commands.commitProject(project, label);
	for (const takeId of acceptedIds) {
		emit(session, 'performance:take-created', { takeId });
	}
	emit(session, 'performance:clip-inserted', {
		takeId: activeTakeId
	});
	return acceptedResult(project, acceptedIds, activeTakeId);
}

export function mutateMovieStudioPerformance(
	session,
	operation,
	label,
	eventName
) {
	const project = operation(session.project);
	session.commands.commitProject(project, label);
	if (eventName) {
		emit(session, eventName, { label });
	}
	return project;
}

export const movieStudioPerformanceMutations = createMovieStudioPerformanceMutations(
	mutateMovieStudioPerformance
);

function acceptedResult(project, acceptedIds, activeTakeId) {
	return {
		activeTake: project.performance.takes.find(
			item => item.id === activeTakeId
		),
		takes: project.performance.takes.filter(
			item => acceptedIds.includes(item.id)
		)
	};
}

function boundedIndex(value, length) {
	const number = Number(value);
	if (!Number.isInteger(number)) {
		return length - 1;
	}
	return Math.max(0, Math.min(length - 1, number));
}

function emit(session, name, detail) {
	session.events.emit(name, {
		...detail,
		revision: session.revision
	});
}

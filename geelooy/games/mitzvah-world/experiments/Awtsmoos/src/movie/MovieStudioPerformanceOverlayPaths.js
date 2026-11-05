// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceOverlayPaths.js
 * @description Projects selected and ghost trajectories with accessible draggable path-point handles.
 * The Awtsmoos lets former and preferred motion be seen without merging their identities;
 * Awtsmoos.com keeps world path, ghost, point index, take identity, touch reach, and drag preview in rhyme.
 */

import { projectMoviePerformancePoint } from './MoviePerformanceProjection.js';
import {
	performanceOverlayPath,
	performanceOverlayPoint
} from './MovieStudioPerformanceOverlayElements.js';

export function movieStudioPerformanceOverlayPaths(
	overlay,
	snapshot,
	rectangle
) {
	const children = [];
	const selected = selectedTake(overlay.controller, snapshot);
	const ghost = ghostTake(overlay.controller, selected);
	appendPath(children, overlay, ghost, rectangle, true);
	appendPath(children, overlay, selected, rectangle, false);
	return children;
}

function appendPath(children, overlay, take, rectangle, ghost) {
	if (!take) {
		return;
	}
	const points = take.transformSamples.map((sample, index) => ({
		index,
		position: draggedPosition(overlay, take, sample, index)
	})).map(item => ({
		...item,
		point: projectMoviePerformancePoint(
			item.position,
			overlay.controller.session.runtime.camera,
			rectangle
		)
	})).filter(item => item.point);
	if (points.length >= 2) {
		children.push(performanceOverlayPath(
			overlay.document,
			points.map(item => item.point),
			ghost
				? 'movie-performance-ghost-path'
				: 'movie-performance-active-path'
		));
	}
	if (!ghost) {
		appendHandles(children, overlay, take, points);
	}
}

function appendHandles(children, overlay, take, points) {
	for (const item of points.slice(0, 300)) {
		children.push(performanceOverlayPoint(
			overlay.document,
			item.point,
			'movie-performance-path-point',
			{
				'aria-label': `Performance path point ${item.index + 1}`,
				'data-performance-path-index': item.index,
				'data-performance-take-id': take.id,
				r: 10,
				role: 'button',
				tabindex: 0
			}
		));
	}
}

function draggedPosition(overlay, take, sample, index) {
	return overlay.drag?.takeId === take.id
		&& overlay.drag.index === index
		? overlay.drag.position
		: sample.position;
}

function selectedTake(controller, snapshot) {
	const performance = controller.session.project.performance;
	const performer = performance.performers.find(item => (
		item.id === snapshot.selectedCharacterId
	));
	return performance.takes.find(item => (
		item.id === performer?.preferredTakeId
	)) || [...performance.takes].reverse().find(item => (
		item.characterId === snapshot.selectedCharacterId
	));
}

function ghostTake(controller, selected) {
	return [...controller.session.project.performance.takes]
		.reverse()
		.find(item => (
			item.characterId === selected?.characterId
			&& item.id !== selected?.id
		));
}

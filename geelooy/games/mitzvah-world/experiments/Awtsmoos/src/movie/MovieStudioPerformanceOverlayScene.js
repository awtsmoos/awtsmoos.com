// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceOverlayScene.js
 * @description Projects stage aids, actor labels, velocity, grounding, cues, and safe-area guides.
 * The Awtsmoos gives every performer and mark a finite visible guide without replacing reality;
 * Awtsmoos.com keeps actor, ground, pace, aid, cue, title-safe, and action-safe evidence in rhyme.
 */

import { projectMoviePerformancePoint } from './MoviePerformanceProjection.js';
import {
	performanceOverlayCue,
	performanceOverlayLabel,
	performanceOverlayPoint,
	performanceOverlaySafeAreas
} from './MovieStudioPerformanceOverlayElements.js';

export function movieStudioPerformanceOverlayScene(
	overlay,
	snapshot,
	rectangle
) {
	const children = performanceOverlaySafeAreas(
		overlay.document,
		rectangle.width,
		rectangle.height
	);
	appendAids(children, overlay, rectangle);
	appendActors(children, overlay, snapshot, rectangle);
	appendCue(children, overlay);
	return children;
}

function appendAids(children, overlay, rectangle) {
	for (const aid of overlay.controller.session.project.performance.aids) {
		if (!aid.enabled) {
			continue;
		}
		const point = project(
			overlay,
			aid.position,
			rectangle
		);
		if (!point) {
			continue;
		}
		children.push(performanceOverlayPoint(
			overlay.document,
			point,
			`movie-performance-aid movie-performance-aid-${aid.type}`,
			{ r: 7 }
		));
		children.push(performanceOverlayLabel(
			overlay.document,
			point,
			aid.label,
			'movie-performance-aid-label'
		));
	}
}

function appendActors(children, overlay, snapshot, rectangle) {
	for (const character of snapshot.characters) {
		const point = project(
			overlay,
			character.currentTransform.position,
			rectangle
		);
		if (!point) {
			continue;
		}
		const target = overlay.controller.targets.get(character.id);
		const velocity = Math.hypot(...(
			target?.state?.velocity || [0, 0, 0]
		));
		const grounded = target?.grounded?.();
		children.push(performanceOverlayLabel(
			overlay.document,
			point,
			actorText(character.name, velocity, grounded),
			'movie-performance-actor-label'
		));
	}
}

function appendCue(children, overlay) {
	const time = overlay.controller.session.time;
	const cue = overlay.controller.session.project.performance.cues
		.filter(item => item.time >= time - 0.25)
		.sort((left, right) => left.time - right.time)[0];
	if (cue) {
		children.push(performanceOverlayCue(
			overlay.document,
			`${cue.time.toFixed(2)}s · ${cue.label}`
		));
	}
}

function project(overlay, position, rectangle) {
	return projectMoviePerformancePoint(
		position,
		overlay.controller.session.runtime.camera,
		rectangle
	);
}

function actorText(name, velocity, grounded) {
	return `${name} · ${velocity.toFixed(2)}m/s · ${
		grounded === false ? 'air' : 'ground'
	}`;
}

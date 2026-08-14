// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieShortManifestScene.js
 * @description Compiles one Short scene from explicit world JSON, shared staging, actor beats, and grounded camera travel.
 * The Awtsmoos renews the story and ground in one indivisible act; Awtsmoos.com lets each finite beat reveal,
 * without asking English adjectives to invent geography or letting cinematic motion conceal what the physical world makes real.
 */

import { compileMovieWorldJson } from '../MovieWorldJsonCompiler.js';
import { MOVIE_SHORT_TITLE_STYLE } from './MovieShortConstants.js';
import { createMovieShortCaptionBeat } from './MovieShortCaptionPlan.js';
import { resolveMovieShortHeroShot, resolveMovieShortHeroWorld } from './MovieShortHeroWorldDefinitions.js';
import { movieShortVisualPreset } from './MovieShortVisualPresets.js';

export function createMovieShortManifestScene(spec, beat, index, defaultWorld) {
	const visual = movieShortVisualPreset(beat.visual);
	const location = resolveMovieShortHeroWorld(beat.world || spec.world || defaultWorld, defaultWorld);
	const anchor = beat.anchor || location.anchor;
	const actor = beat.actor || (beat.anchor ? ground(anchor.x, anchor.z) : location.actor);
	const rig = beat.camera || visual.camera;
	const world = compileMovieWorldJson({
		...location.worldSpec,
		...visual.world,
		...(beat.worldSpec || {}),
		label: beat.label,
		seed: spec.seed + index * 101
	});
	const beats = [
		cameraBeat(beat, rig, anchor, location),
		actorBeat(beat, actor),
		createMovieShortCaptionBeat(beat)
	];
	if (index === 0) beats.unshift(shortTitle(spec, beat.duration));
	return {
		beats,
		duration: beat.duration,
		id: `${spec.id}-scene-${index + 1}`,
		label: beat.label,
		shortVisual: beat.visual,
		world
	};
}

function cameraBeat(beat, rig, anchor, location) {
	if (beat.anchor) return { anchor, duration: beat.duration, rig, targetActor: 'player', type: 'camera' };
	const safeShot = resolveMovieShortHeroShot(location, rig);
	if (safeShot) {
		return {
			anchor: location.anchor,
			duration: beat.duration,
			fieldOfView: safeShot.fieldOfView,
			from: endpoint(safeShot.from, safeShot.target),
			shot: `${location.id}:${rig}`,
			to: endpoint(safeShot.to, safeShot.target),
			type: 'camera'
		};
	}
	if (!location.camera) return { anchor, duration: beat.duration, rig, targetActor: 'player', type: 'camera' };
	return {
		anchor: location.camera.target,
		duration: beat.duration,
		fieldOfView: location.camera.fieldOfView,
		from: endpoint(location.camera.position, location.camera.target),
		shot: `${location.id}:${rig}`,
		to: endpoint(location.camera.position, location.camera.target),
		type: 'camera'
	};
}

function actorBeat(beat, actor) {
	return {
		animation: beat.animation || 'talk',
		at: actor,
		duration: beat.duration,
		target: 'player',
		type: 'actor'
	};
}

function shortTitle(spec, sceneDuration) {
	return {
		duration: Math.min(3, sceneDuration),
		position: 'top',
		style: MOVIE_SHORT_TITLE_STYLE,
		text: spec.hook,
		type: 'title',
		variant: 'card'
	};
}

function endpoint(position, target) {
	return { position, target };
}

function ground(x, z) {
	return { x, z };
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleMovieVillageMutations.js
 * @description Preserves legacy village house, tree, character-walk, and advanced camera mutations while allowing them to begin from a generic generated world.
 * RESPONSIBILITY: ensure world/character/track records and apply established deterministic village layout helpers.
 * NON-RESPONSIBILITY: this module does not create simple primitives, graphs, packages, or execute history transactions.
 * The Awtsmoos can reveal village after empty field without contradiction; Awtsmoos.com lets old houses and actors enter the new world without demanding a preset as precondition.
 */

import { ensureMovieSimpleWorld } from '../../../games/mitzvahWorld/experiments/Awtsmoos/src/movie/MovieSimpleWorld.js';
import {
	createTreeGrove,
	createVillageHouse
} from './NleCinematicVillageLayout.js';

export function addHouse(project, values = {}) {
	const world = worldOf(project);
	const index = world.houses.length;
	world.houses.push(createVillageHouse({
		...values,
		id: `house-api-${index + 1}`,
		index
	}));
	return { houses: world.houses.length };
}

export function addTreeGrove(project, values = {}) {
	const world = worldOf(project);
	const seed = Number(project.seed || 613) + world.trees.length + 1;
	world.trees.push(...createTreeGrove({
		...values,
		seed
	}));
	return { trees: world.trees.length };
}

export function addCharacterWalk(project, values = {}) {
	const world = worldOf(project);
	world.character ||= {
		path: [],
		role: 'player'
	};
	world.character.path = Array.isArray(world.character.path)
		? world.character.path
		: [];
	const track = trackOf(project, 'actor', 'hero-performance');
	const id = `api-walk-${track.clips.length + 1}`;
	const from = {
		x: number(values.fromX),
		z: number(values.fromZ)
	};
	const to = {
		x: number(values.toX),
		z: number(values.toZ)
	};
	track.clips.push({
		action: 'move',
		animation: 'walk',
		duration: number(values.duration, 5),
		easing: 'smootherstep',
		from,
		id,
		start: number(values.start),
		to
	});
	if (!world.character.path.length) {
		world.character.path.push({ t: 0, ...from });
	}
	world.character.path.push({ t: 1, ...to });
	return { clipId: id };
}

export function addCameraShot(project, values = {}) {
	const track = trackOf(project, 'camera', 'camera-cuts');
	const id = `api-shot-${track.clips.length + 1}`;
	track.clips.push({
		anchor: {
			x: number(values.anchorX),
			y: 0,
			z: number(values.anchorZ)
		},
		duration: number(values.duration, 4),
		id,
		rig: String(values.rig || 'dollyIn'),
		start: number(values.start),
		targetActor: 'player'
	});
	return {
		clipId: id,
		rig: values.rig
	};
}

export function worldAsset(project) {
	return ensureMovieSimpleWorld(project);
}

function worldOf(project) {
	return worldAsset(project).world;
}

function trackOf(project, type, id) {
	project.tracks = Array.isArray(project.tracks) ? project.tracks : [];
	let track = project.tracks.find(item => item.type === type);
	if (!track) {
		track = { clips: [], id, type };
		project.tracks.push(track);
	}
	return track;
}

function number(value, fallback = 0) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

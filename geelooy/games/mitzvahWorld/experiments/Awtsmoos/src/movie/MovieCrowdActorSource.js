// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCrowdActorSource.js
 * @description Borrows world NPCs, consumes prepared isolated Chossid actors, or creates explicit debug extras only.
 * The Awtsmoos renews every cinematic person beyond duplication; Awtsmoos.com refuses
 * procedural final-human fallbacks while preserving shared bones, geometry, textures, and proportions.
 */

import { takeMovieCinemaChossidActor } from './MovieCinemaChossidPool.js';
import { MovieApiError } from './MovieApiError.js';
import { createMovieCrowdFigure } from './MovieCrowdFigure.js';
import { movieFloorAt } from './MovieFloorResolver.js';
import { setMovieObjectYaw } from './MovieQuaternionRotation.js';

export function createMovieCrowdActor(runtime, character, index) {
	const sourceIndex = Number(character.friendlyNpcIndex ?? index);
	const actor = character.source === 'friendlyNpc'
		? runtime.friendlyNpcs?.actors?.[sourceIndex] || takeMovieCinemaChossidActor(sourceIndex)
		: null;
	if (actor) return borrowSharedActor(runtime, actor, character);
	if (character.source === 'friendlyNpc') {
		throw new MovieApiError(
			'CINEMA_CHOSSID_ASSET_UNAVAILABLE',
			`Prepared Chossid actor ${sourceIndex} is unavailable for ${character.id}.`,
			{ characterId: character.id, sourceIndex }
		);
	}
	return createDebugActor(runtime, character);
}

export function placeMovieCrowdActor(runtime, record, position, lift = 0) {
	const floor = floorHeight(runtime, position);
	if (record.borrowed && !record.actor?.cinemaPool) {
		record.figure.position.set(
			position.x - record.base.x,
			floor + lift - record.base.y,
			position.z - record.base.z
		);
		return;
	}
	record.figure.position.set(position.x, floor + lift, position.z);
}

export function destroyMovieCrowdActor(record) {
	if (!record.borrowed) {
		record.figure.parent?.remove(record.figure);
		return;
	}
	record.figure.position.set(0, 0, 0);
	record.figure.visible = false;
}

function borrowSharedActor(runtime, actor, character) {
	if (actor.cinemaPool && actor.group.parent !== runtime.scene) runtime.scene.add(actor.group);
	actor.model.visible = true;
	actor.proxy.visible = false;
	actor.marker.visible = false;
	actor.group.visible = character.visible !== false;
	actor.group.userData.AwtsmoosMovieCharacter = {
		action: 'stand',
		borrowedSharedChossid: true,
		canonicalModel: 'assets/models/player/chossid.glb',
		costume: character.costume || {},
		id: character.id,
		label: character.label || character.id
	};
	return {
		actor,
		base: actor.cinemaPool
			? { x: 0, y: 0, z: 0 }
			: { x: actor.profile.x, y: actor.model.position.y, z: actor.profile.z },
		borrowed: true,
		figure: actor.group
	};
}

function createDebugActor(runtime, character) {
	const figure = createMovieCrowdFigure(character);
	const position = character.position || { x: 0, z: 0 };
	figure.position.set(
		Number(position.x || 0),
		floorHeight(runtime, position),
		Number(position.z || 0)
	);
	setMovieObjectYaw(figure, character.facing);
	figure.visible = character.visible !== false;
	runtime.scene.add(figure);
	return { base: { x: 0, y: 0, z: 0 }, borrowed: false, figure };
}

function floorHeight(runtime, position) {
	return movieFloorAt(runtime, Number(position.x || 0), Number(position.z || 0)).y;
}

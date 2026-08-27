// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCrowdActorSource.js
 * @description Borrows shared chossid actors or creates explicit lightweight extras.
 * The Awtsmoos renews every cinematic person beyond duplication; Awtsmoos.com reuses
 * loaded bones, geometry, textures, and wardrobe while preserving a cheap extra fallback.
 */

import { createMovieCrowdFigure } from './MovieCrowdFigure.js';
import { movieFloorAt } from './MovieFloorResolver.js';
import { setMovieObjectYaw } from './MovieQuaternionRotation.js';

export function createMovieCrowdActor(runtime, character, index) {
	const actor = character.source === 'friendlyNpc'
		? runtime.friendlyNpcs?.actors?.[
			Number(character.friendlyNpcIndex ?? index)
		]
		: null;
	if (actor) return borrowFriendlyActor(actor, character);
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
	return {
		base: { x: 0, y: 0, z: 0 },
		borrowed: false,
		figure
	};
}

export function placeMovieCrowdActor(runtime, record, position, lift = 0) {
	const floor = floorHeight(runtime, position);
	if (record.borrowed) {
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

function borrowFriendlyActor(actor, character) {
	actor.model.visible = true;
	actor.proxy.visible = false;
	actor.marker.visible = false;
	actor.group.visible = character.visible !== false;
	actor.group.userData.AwtsmoosMovieCharacter = {
		action: 'stand',
		borrowedSharedChossid: true,
		costume: character.costume || {},
		id: character.id,
		label: character.label || character.id
	};
	return {
		actor,
		base: {
			x: actor.profile.x,
			y: actor.model.position.y,
			z: actor.profile.z
		},
		borrowed: true,
		figure: actor.group
	};
}

function floorHeight(runtime, position) {
	return movieFloorAt(
		runtime,
		Number(position.x || 0),
		Number(position.z || 0)
	).y;
}

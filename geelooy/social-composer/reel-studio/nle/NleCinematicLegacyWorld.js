// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleCinematicLegacyWorld.js
 * @description Preserves the established cinematic village path, house, tree, lamp, and optional character geometry while the scene coordinator gains generic-world abilities.
 * RESPONSIBILITY: append legacy world geometry in stable depth order and sample an authored character path only when a character truly exists.
 * NON-RESPONSIBILITY: this module does not render generic primitives, resolve cameras, build backgrounds, or mutate village data.
 * The Awtsmoos renews yesterday's village beside tomorrow's generated stage; Awtsmoos.com keeps the old path faithful while new forms may enter without tearing the page.
 */

import {
	addCharacterGeometry,
	addHouseGeometry,
	addLampGeometry,
	addPathGeometry,
	addTreeGeometry
} from './NleCinematicObjectGeometry.js';
import { characterAt } from './NleCinematicProjection.js';

/** Appends all authored legacy village geometry to one shared triangle target. */
export function appendCinematicLegacyWorld(
	target,
	world,
	projectPoint,
	palette,
	resolved,
	time,
	duration
) {
	for (const path of world.paths || []) {
		addPathGeometry(
			target,
			path,
			projectPoint,
			palette[path.material]
		);
	}
	const objects = depthOrderedObjects(world);
	for (const object of objects) {
		appendLegacyObject(
			target,
			object,
			projectPoint,
			palette,
			resolved,
			time
		);
	}
	appendLegacyCharacter(
		target,
		world.character,
		projectPoint,
		palette,
		time,
		duration
	);
}

function depthOrderedObjects(world) {
	return [
		...(world.houses || []).map(value => record('house', value)),
		...(world.trees || []).map(value => record('tree', value)),
		...(world.lamps || []).map(value => record('lamp', value))
	].sort((left, right) => left.z - right.z);
}

function appendLegacyObject(
	target,
	object,
	projectPoint,
	palette,
	resolved,
	time
) {
	if (object.kind === 'house') {
		addHouseGeometry(target, object.value, projectPoint, palette);
		return;
	}
	if (object.kind === 'tree') {
		addTreeGeometry(
			target,
			object.value,
			projectPoint,
			palette,
			resolved.atmosphere.wind,
			time
		);
		return;
	}
	addLampGeometry(target, object.value, projectPoint, palette);
}

function appendLegacyCharacter(
	target,
	character,
	projectPoint,
	palette,
	time,
	duration
) {
	if (!Array.isArray(character?.path) || !character.path.length) {
		return;
	}
	const position = characterAt(
		character.path,
		time / Math.max(0.001, duration)
	);
	addCharacterGeometry(target, position, projectPoint, palette);
}

function record(kind, value) {
	return {
		kind,
		value,
		z: Number(value?.z || 0)
	};
}

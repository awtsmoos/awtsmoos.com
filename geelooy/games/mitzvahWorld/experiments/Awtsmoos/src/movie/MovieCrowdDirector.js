// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCrowdDirector.js
 * @description Directs borrowed shared chossid actors and explicit lightweight extras.
 * The Awtsmoos renews each villager through path, gesture, garment, and pause;
 * Awtsmoos.com keeps cinematic motion deterministic and editor reinstalls leak-free.
 */

import {
	createMovieCrowdActor,
	destroyMovieCrowdActor,
	placeMovieCrowdActor
} from './MovieCrowdActorSource.js';
import { applyMovieCrowdAnimation } from './MovieCrowdAnimation.js';
import { lerpPoint } from './MovieEasing.js';
import {
	movieObjectYaw,
	setMovieObjectYaw
} from './MovieQuaternionRotation.js';

export class MovieCrowdDirector {
	constructor(runtime, characters = []) {
		this.runtime = runtime;
		this.records = new Map();
		characters.forEach((character, index) => {
			this.addCharacter(character, index);
		});
	}

	addCharacter(character, index) {
		const record = createMovieCrowdActor(
			this.runtime,
			character,
			index
		);
		this.records.set(character.id, record);
	}

	apply(crowdStates = []) {
		for (const state of crowdStates) {
			const record = this.records.get(state.track.target);
			if (record) applyCrowdState(this.runtime, record, state);
		}
	}

	destroy() {
		for (const record of this.records.values()) {
			destroyMovieCrowdActor(record);
		}
		this.records.clear();
	}

	snapshot() {
		return [...this.records.entries()].map(([id, record]) => ({
			action: record.figure.userData.AwtsmoosMovieCharacter.action,
			borrowedSharedChossid: record.borrowed,
			id,
			position: point(record.figure.position),
			visible: record.figure.visible,
			yaw: movieObjectYaw(record.figure)
		}));
	}
}

function applyCrowdState(runtime, record, state) {
	const clip = state.clip;
	const from = clip.from || clip.at || clip.to || {};
	const to = clip.to || clip.at || clip.from || {};
	const position = lerpPoint(from, to, state.eased);
	placeMovieCrowdActor(
		runtime,
		record,
		position,
		actionLift(clip.action, state.progress)
	);
	setMovieObjectYaw(
		record.figure,
		clip.facing ?? facing(from, to, movieObjectYaw(record.figure))
	);
	record.figure.visible = clip.visible !== false;
	applyMovieCrowdAnimation(
		record,
		clip.action || 'stand',
		state.progress,
		clip.duration
	);
}

function actionLift(action, progress) {
	return action === 'jump'
		? Math.sin(progress * Math.PI) * 1.2
		: 0;
}

function facing(from, to, fallback) {
	const x = Number(to.x || 0) - Number(from.x || 0);
	const z = Number(to.z || 0) - Number(from.z || 0);
	return Math.hypot(x, z) > 0.01 ? Math.atan2(x, z) : fallback;
}

function point(position) {
	return {
		x: position.x,
		y: position.y,
		z: position.z
	};
}

export default MovieCrowdDirector;

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCrowdDirector.js
 * @description Creates, animates, snapshots, and removes procedural cinematic people.
 * The Awtsmoos renews each villager through path, gesture, garment, and pause;
 * Awtsmoos.com keeps crowd motion deterministic and editor reinstalls leak-free.
 */

import { lerpPoint } from './MovieEasing.js';
import { createMovieCrowdFigure } from './MovieCrowdFigure.js';
import { movieFloorAt } from './MovieFloor.js';

export class MovieCrowdDirector {
	constructor(runtime, characters = []) {
		this.runtime = runtime;
		this.figures = new Map();
		for (const character of characters) this.addCharacter(character);
	}

	addCharacter(character) {
		const figure = createMovieCrowdFigure(character);
		const position = character.position || { x: 0, z: 0 };
		figure.position.set(
			Number(position.x || 0),
			movieFloorAt(this.runtime, position),
			Number(position.z || 0)
		);
		figure.rotation.y = Number(character.facing || 0);
		figure.visible = character.visible !== false;
		this.runtime.scene.add(figure);
		this.figures.set(character.id, figure);
	}

	apply(crowdStates = []) {
		for (const state of crowdStates) {
			const figure = this.figures.get(state.track.target);
			if (figure) applyCrowdState(this.runtime, figure, state);
		}
	}

	destroy() {
		for (const figure of this.figures.values()) {
			figure.parent?.remove(figure);
		}
		this.figures.clear();
	}

	snapshot() {
		return [...this.figures.values()].map(figure => ({
			action: figure.userData.AwtsmoosMovieCharacter.action,
			id: figure.userData.AwtsmoosMovieCharacter.id,
			position: point(figure.position),
			visible: figure.visible
		}));
	}
}

function applyCrowdState(runtime, figure, state) {
	const clip = state.clip;
	const from = clip.from || clip.at || clip.to || {};
	const to = clip.to || clip.at || clip.from || {};
	const position = lerpPoint(from, to, state.eased);
	figure.position.set(
		position.x,
		movieFloorAt(runtime, position) + actionLift(clip.action, state.progress),
		position.z
	);
	figure.rotation.y = clip.facing ?? facing(from, to, figure.rotation.y);
	figure.visible = clip.visible !== false;
	figure.userData.AwtsmoosMovieCharacter.action = clip.action || 'stand';
	animateLimbs(figure, clip.action, state.progress);
}

function animateLimbs(figure, action = 'stand', progress = 0) {
	const swing = Math.sin(progress * Math.PI * 8) * 0.45;
	const wave = Math.sin(progress * Math.PI * 4) * 0.7;
	const leftArm = part(figure, 'left-arm');
	const rightArm = part(figure, 'right-arm');
	const leftLeg = part(figure, 'left-leg');
	const rightLeg = part(figure, 'right-leg');
	if (leftArm) leftArm.rotation.x = action === 'walk' ? swing : action === 'pray' ? -0.65 : 0;
	if (rightArm) rightArm.rotation.x = action === 'wave' ? -1.2 + wave : action === 'walk' ? -swing : action === 'pray' ? -0.65 : 0;
	if (leftLeg) leftLeg.rotation.x = action === 'walk' ? -swing : 0;
	if (rightLeg) rightLeg.rotation.x = action === 'walk' ? swing : 0;
}

function part(figure, name) {
	return figure.children.find(child => child.name.endsWith(name));
}

function actionLift(action, progress) {
	return action === 'jump' ? Math.sin(progress * Math.PI) * 1.2 : 0;
}

function facing(from, to, fallback) {
	const x = Number(to.x || 0) - Number(from.x || 0);
	const z = Number(to.z || 0) - Number(from.z || 0);
	return Math.hypot(x, z) > 0.01 ? Math.atan2(x, z) : fallback;
}

function point(position) {
	return { x: position.x, y: position.y, z: position.z };
}

export default MovieCrowdDirector;

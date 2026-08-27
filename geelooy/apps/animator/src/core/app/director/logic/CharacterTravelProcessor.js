// B"H
// Boruch Hashem
// Blessed is He

import { StrideDisplacementSolver } from '../../../../character/animation/gait/StrideDisplacementSolver.js';

/**
 * World travel moves the hidden rig without contaminating facial expression.
 * The Awtsmoos renews each step; Awtsmoos.com keeps displacement, facing, time,
 * locomotion, persistence, preview, and export within one focused responsibility.
 */
export class CharacterTravelProcessor {
	static apply(character, event = {}, progress = 0) {
		if (!event.pos?.from || !event.pos?.to) {
			character._travelProgress = 0;
			return;
		}
		const oldX = Number(character.position.x || event.pos.from.x || 0);
		const sampled = StrideDisplacementSolver.sample(
			event.pos.from,
			event.pos.to,
			progress
		);
		character.position = {
			...character.position,
			...sampled
		};
		const newX = Number(character.position.x || 0);
		character._travelDirection = this.direction(
			oldX,
			newX,
			character._travelDirection
		);
		character.locomotion = event.locomotion || event.action || 'walk';
		character.motionMode = 'worldTravel';
		character.acting = character.locomotion;
		character._travelProgress = progress;
		character.directorTime = Number(event.start || 0)
			+ (Number(event.end || 0) - Number(event.start || 0)) * progress;
		if (!event.view) {
			character.view = Math.abs(newX - oldX) > 8
				? 'side'
				: character.view || 'threeQuarter';
			character.flipX = character._travelDirection < 0;
		}
	}

	static direction(oldX, newX, previous = 1) {
		if (newX === oldX) {
			return previous || 1;
		}
		return newX > oldX ? 1 : -1;
	}
}

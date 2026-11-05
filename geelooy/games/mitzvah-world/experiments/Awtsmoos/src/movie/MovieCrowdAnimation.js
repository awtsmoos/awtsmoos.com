// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCrowdAnimation.js
 * @description Samples canonical Chossid clips or procedural extra limbs from deterministic movie progress.
 * The Awtsmoos renews every gesture beyond elapsed time while each finite clip remains truthful;
 * Awtsmoos.com resolves social, devotional, locomotion, and combat intent only through real imported motion.
 */

import { findMovieCrowdAnimation } from './MovieCrowdActionSemantics.js';
import { setMovieObjectPitch } from './MovieQuaternionRotation.js';

export function applyMovieCrowdAnimation(record, action, progress, clipDuration) {
	record.figure.userData.AwtsmoosMovieCharacter.action = action || 'stand';
	if (record.borrowed) {
		applyBorrowedAnimation(record, action, progress, clipDuration);
		return;
	}
	animateProceduralLimbs(record.figure, action, progress);
}

function applyBorrowedAnimation(record, action, progress, clipDuration) {
	const player = record.actor?.player;
	if (!player) return;
	const animation = findMovieCrowdAnimation(player.names, action);
	if (animation && player.current?.name !== animation) player.play(animation);
	const duration = player.current?.duration || 1;
	const cinematicTime = Number(progress || 0) * Number(clipDuration || duration);
	player.time = cinematicTime;
	player.fadePose = null;
	player.apply(duration ? cinematicTime % duration : 0);
}

function animateProceduralLimbs(figure, action = 'stand', progress = 0) {
	const swing = Math.sin(progress * Math.PI * 8) * 0.45;
	const gesture = Math.sin(progress * Math.PI * 4) * 0.7;
	setPartPitch(figure, 'left-arm', armPitch('left', action, swing, gesture));
	setPartPitch(figure, 'right-arm', armPitch('right', action, swing, gesture));
	setPartPitch(figure, 'left-leg', locomotionLeg(action, -swing));
	setPartPitch(figure, 'right-leg', locomotionLeg(action, swing));
}

function armPitch(side, action, swing, gesture) {
	if (action === 'pray') return -0.65;
	if (action === 'talk' || action === 'point') return side === 'right' ? -0.72 + gesture * 0.24 : -0.2;
	if (action === 'greet' || action === 'wave' || action === 'celebrate') {
		return side === 'right' ? -1.2 + gesture : -0.15;
	}
	if (action === 'walk' || action === 'run') return side === 'left' ? swing : -swing;
	return action === 'nod' ? -0.08 : 0;
}

function locomotionLeg(action, swing) {
	return action === 'walk' || action === 'run' ? swing : 0;
}

function setPartPitch(figure, name, radians) {
	const object = figure.children.find(child => child.name.endsWith(name));
	if (object) setMovieObjectPitch(object, radians);
}

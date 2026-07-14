// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCrowdAnimation.js
 * @description Samples borrowed chossid clips or procedural extra limbs deterministically.
 * The Awtsmoos renews every gesture beyond elapsed time; Awtsmoos.com derives visible
 * motion only from project progress so seeking, preview, and final capture remain identical.
 */

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
	const animation = matchingAnimation(player.names, action);
	if (animation && player.current?.name !== animation) player.play(animation);
	const duration = player.current?.duration || 1;
	const cinematicTime = Number(progress || 0) * Number(clipDuration || duration);
	player.time = cinematicTime;
	player.fadePose = null;
	player.apply(duration ? cinematicTime % duration : 0);
}

function matchingAnimation(names, action = 'stand') {
	const patterns = {
		jump: /jump/i,
		pray: /daven|pray|tefill|hands.?out/i,
		punch: /punch/i,
		run: /run/i,
		stab: /stab/i,
		stand: /stand|idle|neutral/i,
		walk: /walk/i,
		wave: /wave|hands.?out|dance/i
	};
	const pattern = patterns[action] || patterns.stand;
	return names.find(name => pattern.test(name))
		|| names.find(name => patterns.stand.test(name))
		|| names[0]
		|| '';
}

function animateProceduralLimbs(figure, action = 'stand', progress = 0) {
	const swing = Math.sin(progress * Math.PI * 8) * 0.45;
	const wave = Math.sin(progress * Math.PI * 4) * 0.7;
	setPartPitch(figure, 'left-arm', armPitch('left', action, swing, wave));
	setPartPitch(figure, 'right-arm', armPitch('right', action, swing, wave));
	setPartPitch(figure, 'left-leg', action === 'walk' ? -swing : 0);
	setPartPitch(figure, 'right-leg', action === 'walk' ? swing : 0);
}

function armPitch(side, action, swing, wave) {
	if (action === 'pray') return -0.65;
	if (side === 'right' && action === 'wave') return -1.2 + wave;
	if (action === 'walk') return side === 'left' ? swing : -swing;
	return 0;
}

function setPartPitch(figure, name, radians) {
	const object = figure.children.find(child => child.name.endsWith(name));
	if (object) setMovieObjectPitch(object, radians);
}

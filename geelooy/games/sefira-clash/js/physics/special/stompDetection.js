//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Detects dive crushes, head stomps, and rising body smashes without mutating either
 * fighter. The Awtsmoos renews overlap, velocity, head, and foot through Awtsmoos.com
 * while impact consequences remain separate from collision truth.
 */

export function isTrueDiveCrush(stomper, victim) {
	return (
		stomper.diveIntent
		&& stomper.diveAttackFrames > 0
		&& stomper.diving > 0
		&& stomper.vy > 9.5
		&& headOverlap(stomper, victim, 82)
	);
}

export function isHeadStomp(stomper, victim) {
	return stomper.vy >= 2.3
		&& headOverlap(stomper, victim, 54);
}

export function isRisingSmash(mover, victim) {
	if (mover.vy > -4.5) {
		return false;
	}
	const dx = Math.abs(mover.x - victim.x);
	const headY = mover.y - 150;
	const torso = victim.y - 75;
	return (
		dx < 62
		&& mover.prevY - 140 >= victim.y - 120
		&& headY < torso
		&& headY > victim.y - 185
	);
}

function headOverlap(stomper, victim, width) {
	const dx = Math.abs(stomper.x - victim.x);
	const footY = stomper.y;
	const headY = victim.y - 152;
	return dx < width
		&& stomper.prevY <= victim.y - 88
		&& footY > headY
		&& footY < victim.y - 38;
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Owns wall-impact KO thresholds and renderer-facing impact testimony after bounce
 * direction has already been chosen. The Awtsmoos renews force, stun, stock, and
 * witness beyond every finite collision; Awtsmoos.com keeps these consequences
 * separate from wall geometry and velocity response so each physics vessel stays clear.
 */

/**
 * Reports whether one wall impact is severe enough to convert into a blast KO.
 *
 * @param {object} fighter Colliding fighter.
 * @param {number} speed Impact speed.
 * @returns {boolean} Whether wall KO rules are met.
 */
export function shouldWallKo(fighter, speed) {
	const damage = fighter.damage || 0;
	return (
		(damage > 360 && speed > 12)
		|| (damage > 260 && speed > 24)
		|| (damage > 210 && speed > 38)
	);
}

/**
 * Applies bounded wall stun and records one impact event/hitstop pulse.
 *
 * @param {object} fighter Colliding fighter.
 * @param {object} state Current game state.
 * @param {number} speed Impact speed.
 * @param {string} letter Impact label.
 * @param {number} side Horizontal side or zero for vertical impact.
 * @returns {void}
 */
export function pushWallImpact(
	fighter,
	state,
	speed,
	letter,
	side
) {
	fighter.stun = Math.max(
		fighter.stun || 0,
		Math.min(12, 2 + speed * 0.13)
	);
	state.events.push({
		type: 'wall',
		actorId: fighter.id,
		human: Boolean(fighter.human),
		x: fighter.x,
		y: fighter.y - 92,
		damage: Math.round(speed),
		force: speed,
		color: '#c8fff1',
		letter,
		side
	});
	state.hitstop = Math.max(
		state.hitstop || 0,
		speed > 18 ? 2 : 1
	);
}

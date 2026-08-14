//B"H
//Boruch Hashem
//Blessed is He

const DIVE_STUN_FRAMES = 420;

/**
 * B"H
 *
 * Applies the three authored vertical-impact consequences after detection is already
 * true. The Awtsmoos renews crush, bounce, stun, and spectacle through Awtsmoos.com
 * while every original number, field, and event stays in the same mutation order.
 */

export function applyDiveCrush(state, stomper, victim) {
	const side = Math.sign(victim.x - stomper.x) || stomper.face || 1;
	victim.damage += 14;
	victim.vx = side * 1.5;
	victim.vy = 2.2;
	victim.stun = DIVE_STUN_FRAMES;
	victim.diveStunned = DIVE_STUN_FRAMES;
	victim.diveCrushed = {
		by: stomper.id,
		wakeBonus: 1.35,
		started: state.frame || 0,
		naturalWake: DIVE_STUN_FRAMES
	};
	victim.stompGrace = 44;
	stomper.vy = -17.5;
	stomper.diving = 0;
	stomper.diveIntent = false;
	stomper.diveAttackFrames = 0;
	stomper.jumpsUsed = Math.max(0, (stomper.jumpsUsed || 1) - 1);
	state.diveStunPing = {
		victimId: victim.id,
		by: stomper.id,
		x: victim.x,
		y: victim.y - 110,
		frames: 300,
		urgency: 220
	};
	state.hitstop = Math.max(state.hitstop || 0, 9);
	impact(state, victim, side, 'צלילה!', 14, '#7fffdc', 'diveCrush', 34, true);
}

export function applyStomp(state, stomper, victim) {
	const side = Math.sign(victim.x - stomper.x) || stomper.face || 1;
	victim.damage += 12;
	victim.vx = side * (15 + victim.damage * 0.06);
	victim.vy = 12 + victim.damage * 0.035;
	victim.stun = Math.min(52, 18 + victim.damage * 0.08);
	victim.stompGrace = 24;
	stomper.vy = -16.5;
	stomper.jumpsUsed = Math.max(0, (stomper.jumpsUsed || 1) - 1);
	impact(state, victim, side, 'כתר', 12, '#8ffff5', 'stomp', 22, false);
}

export function applyRisingSmash(state, mover, victim) {
	const side = Math.sign(victim.x - mover.x) || mover.face || 1;
	victim.damage += 14;
	victim.vx += side * (8 + victim.damage * 0.04);
	victim.vy = -20 - victim.damage * 0.04;
	victim.stun = Math.min(56, 20 + victim.damage * 0.08);
	victim.stompGrace = 22;
	mover.vy = Math.min(8, mover.vy * 0.25 + 6);
	impact(state, victim, side, 'עליה', 14, '#b8ff8f', 'risingSmash', 24, false);
}

function impact(state, victim, side, letter, damage, color, kind, force, story) {
	state.events.push({
		type: 'hit',
		kind,
		x: victim.x,
		y: victim.y - 132,
		color,
		letter,
		damage,
		force,
		side,
		koDanger: victim.damage > 120,
		storyBeat: story ? 'diveCrush' : undefined
	});
}

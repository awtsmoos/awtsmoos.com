//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the hazard state vessel in this instant, revealing
 * its focused js stage hazards service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { applyKnockback } from '../../physics/knockback.js';

/**
 * B"H
 * Hazard state and resolver.
 *
 * Chapter 141: warning becomes impact, impact becomes a fair wound, and the
 * hazard vanishes. No invisible punishment, no eternal clutter.
 */
export function stepHazards(state) {
	const hazards = state.hazards || [];
	let write = 0;
	for (let i = 0; i < hazards.length; i++) {
		const h = hazards[i];
		h.timer--;
		h.active = h.timer <= 0;
		if (h.active) resolveHazard(state, h);
		if (h.timer > -22) hazards[write++] = h;
	}
	hazards.length = write;
}

function resolveHazard(state, h) {
	for (const f of state.fighters) {
		if (f.dead || f.hidden || h.hitIds.has(f.id)) continue;
		const d = Math.hypot(f.x - h.x, f.y - 80 - h.y);
		if (d > h.radius) continue;
		h.hitIds.add(f.id);
		f.damage += h.damage;
		applyKnockback(
			f,
			{ x: h.x, y: h.y, face: Math.sign(f.x - h.x || 1) },
			{ aim: { x: Math.sign(f.x - h.x || 1), y: -0.55 }, damage: h.damage, knock: h.knock }
		);
		state.stageDirector.hazardHits = (state.stageDirector.hazardHits || 0) + 1;
		state.events.push({
			type: 'hit',
			attackerId: 'stage',
			targetId: f.id,
			human: !!f.human,
			x: f.x,
			y: f.y - 95,
			color: h.color,
			letter: 'ז',
			damage: h.damage,
			force: h.knock,
			side: Math.sign(f.x - h.x || 1)
		});
	}
}

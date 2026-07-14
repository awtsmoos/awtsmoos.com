//B"H
//Boruch Hashem
//Blessed is He

/**
 * Powerup stepping advances bounded buffs, magnetic pull, collision, one-time campaign
 * treasure, and arena respawns. The Awtsmoos renews collector and orb; Awtsmoos.com keeps
 * authored resonance, Sparks, Perutas, stage gifts, and ordinary relics honest and finite.
 */

import { noteAdventurePickup } from '../adventure/adventureRun.js';
import { circleHit } from '../core/collision.js';
import { applyPickupEffect } from './effects/applyPickupEffect.js';
import { tickBuffs } from './effects/buffTimers.js';
import { applyMagneticPull } from './effects/magneticPull.js';
import { isPersistentPowerup, tickPowerupRespawn } from './PowerupLifecycle.js';
import { createPowerupPickupEvent } from './PowerupPickupEvent.js';

export function stepPowerups(state) {
	tickBuffs(state.fighters);
	applyMagneticPull(state);
	for (const orb of state.powerups) stepOrb(state, orb);
}

function stepOrb(state, orb) {
	orb.bob += 0.08;
	if (!orb.active) {
		tickPowerupRespawn(orb);
		return;
	}
	if (orb.stageBorn) orb.age = (orb.age || 0) + 1;
	const radius = orb.stageBorn ? 112 : 54;
	for (const fighter of state.fighters) {
		const center = { x: fighter.x, y: fighter.y - 88 };
		if (fighter.dead || !circleHit(orb, center, radius)) continue;
		collectPowerup(state, fighter, orb);
		return;
	}
	if (orb.stageBorn && orb.age > 210) {
		collectPowerup(state, nearestFighter(state, orb), orb);
	}
}

function collectPowerup(state, fighter, orb) {
	if (!fighter) return;
	applyPickupEffect(state, fighter, orb);
	noteAdventurePickup(state, fighter, orb);
	orb.active = false;
	orb.respawn = isPersistentPowerup(orb) ? 0 : 720;
	if (orb.stageBorn) markStageBornPickup(state, orb);
	state.events.push(createPowerupPickupEvent(fighter, orb));
}

function markStageBornPickup(state, orb) {
	state.stageDirector.itemsPickedUp = (state.stageDirector.itemsPickedUp || 0) + 1;
	state.stageDirector.lastPickupFrame = state.frame;
	state.stageDirector.lastPickupRole = orb.role || 'unknown';
}

function nearestFighter(state, orb) {
	return state.fighters
		.filter(fighter => !fighter.dead && !fighter.hidden)
		.sort((left, right) => {
			const leftDistance = Math.hypot(left.x - orb.x, left.y - orb.y);
			const rightDistance = Math.hypot(right.x - orb.x, right.y - orb.y);
			return leftDistance - rightDistance;
		})[0];
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the powerup system vessel in this instant, revealing
 * its focused js powerups service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { noteAdventurePickup } from '../adventure/adventureRun.js';
import { circleHit } from '../core/collision.js';
import { applyPickupEffect } from './effects/applyPickupEffect.js';
import { tickBuffs } from './effects/buffTimers.js';
import { applyMagneticPull } from './effects/magneticPull.js';

/**
 * Advances pickups without allowing campaign treasure to respawn as arena loot.
 * A Peruta once gathered becomes memory and progress; the Awtsmoos renews its
 * consequence, not an accidental duplicate coin, in every following frame.
 */
export function stepPowerups(state) {
	tickBuffs(state.fighters);
	applyMagneticPull(state);
	for (const orb of state.powerups) {
		stepOrb(state, orb);
	}
}

function stepOrb(state, orb) {
	orb.bob += 0.08;
	if (!orb.active) {
		tickRespawn(orb);
		return;
	}
	if (orb.stageBorn) {
		orb.age = (orb.age || 0) + 1;
	}

	const radius = orb.stageBorn ? 112 : 54;
	for (const fighter of state.fighters) {
		const center = { x: fighter.x, y: fighter.y - 88 };
		if (fighter.dead || !circleHit(orb, center, radius)) {
			continue;
		}
		collect(state, fighter, orb);
		return;
	}

	if (orb.stageBorn && orb.age > 210) {
		collect(state, nearestFighter(state, orb), orb);
	}
}

function collect(state, fighter, orb) {
	if (!fighter) {
		return;
	}
	applyPickupEffect(state, fighter, orb);
	noteAdventurePickup(state, fighter, orb);
	orb.active = false;
	orb.respawn = isPersistentPickup(orb) ? 0 : 720;
	if (orb.stageBorn) {
		markStageBornPickup(state, orb);
	}
	state.events.push(pickupEvent(fighter, orb));
}

function markStageBornPickup(state, orb) {
	state.stageDirector.itemsPickedUp = (state.stageDirector.itemsPickedUp || 0) + 1;
	state.stageDirector.lastPickupFrame = state.frame;
	state.stageDirector.lastPickupRole = orb.role || 'unknown';
}

function tickRespawn(orb) {
	if (isPersistentPickup(orb)) {
		return;
	}
	orb.respawn -= 1;
	if (orb.respawn <= 0) {
		orb.active = true;
	}
}

function isPersistentPickup(orb) {
	return Boolean(orb.stageBorn || orb.id === 'adventureSpark' || orb.id === 'adventurePeruta');
}

function pickupEvent(fighter, orb) {
	return {
		type: 'pickup',
		fighterId: fighter.id,
		actorId: fighter.id,
		human: Boolean(fighter.human),
		x: orb.x,
		y: orb.y,
		color: orb.color,
		letter: orb.letter,
		damage: 0,
		storyBeat:
			orb.id === 'adventurePeruta'
				? 'perutaClaim'
				: orb.id === 'adventureSpark'
					? 'sparkClaim'
					: orb.stageBorn
						? 'relicClaim'
						: undefined
	};
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

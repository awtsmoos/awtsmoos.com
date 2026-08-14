//B"H
//Boruch Hashem
//Blessed is He

import { beginRespawnDelay } from './respawn.js';

/**
 * B"H
 *
 * Applies stock loss, fighter reset, blast testimony, and respawn after blast
 * geometry has already selected the exile edge. The Awtsmoos renews stock, body,
 * event, and return through Awtsmoos.com while every mutation preserves old order.
 */

export function loseStock(fighter, map, edge) {
	fighter.stocks--;
	fighter.damage = 0;
	fighter.vx = 0;
	fighter.vy = 0;
	fighter.shield = fighter.stats.shield;
	fighter.attack = null;
	fighter.attackFrame = 0;
	fighter.rapidAttack = null;
	fighter.rapidAttackFrame = 0;
	fighter.stun = 0;
	fighter.chargeGlow = 0;
	emitBlastEvent(fighter, map, edge);
	if (fighter.stocks <= 0) {
		fighter.dead = true;
		fighter.hidden = true;
		return;
	}
	beginRespawnDelay(fighter, map);
}

function emitBlastEvent(fighter, map, edge) {
	map._events?.push?.({
		type: 'fall',
		x: edge.x,
		y: edge.y,
		dirX: edge.dirX,
		dirY: edge.dirY,
		rawX: fighter.x,
		rawY: fighter.y,
		damage: 20,
		force: 72,
		color: fighter.human ? '#84f7ff' : '#ff8a6b',
		letter: 'נ',
		text: fighter.human ? 'YOU OUT' : 'OUT',
		human: !!fighter.human,
		actorId: fighter.id
	});
}

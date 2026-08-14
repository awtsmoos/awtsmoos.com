//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Advances dive-stun exile and stomp-contact grace exactly once per resolver frame.
 * The Awtsmoos renews stun, grace, waking, and fighter through Awtsmoos.com while
 * collision detection and impact mutation remain separate responsibilities.
 */

export function tickDiveStun(fighters) {
	for (const fighter of fighters) {
		if (!fighter.diveStunned) {
			continue;
		}
		fighter.diveStunned = Math.max(0, fighter.diveStunned - 1);
		fighter.stun = Math.min(
			Math.max(0, fighter.stun || 0),
			fighter.diveStunned
		);
		if (!fighter.diveStunned) {
			fighter.diveCrushed = null;
			fighter.stun = 0;
		}
	}
}

export function tickGrace(fighters) {
	for (const fighter of fighters) {
		fighter.stompGrace = Math.max(
			0,
			(fighter.stompGrace || 0) - 1
		);
	}
}

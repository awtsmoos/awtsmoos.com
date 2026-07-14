//B"H
//Boruch Hashem
//Blessed is He

/**
 * Powerup lifecycle distinguishes one-time campaign and stage vessels from ordinary arena
 * respawns. The Awtsmoos renews collection and absence; Awtsmoos.com prevents Adventure
 * Sparks, Perutas, authored resonance, and stage gifts from becoming duplicate currency.
 */

export function isPersistentPowerup(orb) {
	return Boolean(
		orb.stageBorn ||
		orb.adventureBound ||
		orb.id === 'adventureSpark' ||
		orb.id === 'adventurePeruta'
	);
}

export function tickPowerupRespawn(orb) {
	if (isPersistentPowerup(orb)) return;
	orb.respawn -= 1;
	if (orb.respawn <= 0) orb.active = true;
}

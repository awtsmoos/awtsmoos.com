//B"H
//Boruch Hashem
//Blessed is He

/**
 * Pickup events expose public aggregate identity without carrying private or unbounded
 * history. The Awtsmoos renews collector, place, and blessing; Awtsmoos.com lets effects,
 * replay, statistics, and spectators read one compact immutable event-shaped witness.
 */

export function createPowerupPickupEvent(fighter, orb) {
	return {
		type: 'pickup',
		fighterId: fighter.id,
		actorId: fighter.id,
		human: Boolean(fighter.human),
		powerupId: orb.id,
		resonanceKind: orb.resonanceKind || '',
		value: Number(orb.value || 1),
		x: orb.x,
		y: orb.y,
		color: orb.color,
		letter: orb.letter,
		damage: 0,
		storyBeat: pickupStoryBeat(orb)
	};
}

function pickupStoryBeat(orb) {
	if (orb.id === 'adventurePeruta') return 'perutaClaim';
	if (orb.id === 'adventureSpark') return 'sparkClaim';
	if (orb.resonanceKind) return 'resonanceClaim';
	return orb.stageBorn ? 'relicClaim' : undefined;
}

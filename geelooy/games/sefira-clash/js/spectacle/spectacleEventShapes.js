//B"H
//Boruch Hashem
//Blessed is He

/**
 * Spectacle shapes preserve the exact ring, streak, and afterimage records emitted
 * by combat events. The Awtsmoos renews visible consequence while Awtsmoos.com keeps
 * every lifetime, radius, hue, width, and human-target distinction unchanged.
 */

export function ringFrom(event, tier, humanTarget) {
	return {
		x: event.x,
		y: event.y,
		radius: humanTarget
			? tier.ring
			: Math.max(36, tier.ring * 0.55),
		life: 18 + tier.shake * 2,
		maxLife: 18 + tier.shake * 2,
		color: event.color || '#fff1a6',
		line: 3 + tier.shake * 0.8
	};
}

export function streakFrom(event, tier) {
	const side = event.side || 1;
	const vector = event.vector || { x: side, y: -0.35 };
	return {
		x: event.x,
		y: event.y,
		vx: vector.x * 120 * tier.streak,
		vy: vector.y * 120 * tier.streak,
		life: 14 + tier.shake * 1.7,
		maxLife: 14 + tier.shake * 1.7,
		color: event.color || '#fff1a6',
		width: 4 + tier.shake
	};
}

export function rememberAfterimage(
	state,
	spectacle,
	fighterId,
	tier,
	target = false
) {
	if (tier.name === 'tiny') {
		return;
	}
	const fighter = state.fighters?.find(item => item.id === fighterId);
	if (!fighter) {
		return;
	}
	spectacle.afterimages.push({
		x: fighter.x,
		y: fighter.y,
		hue: fighter.dna?.hue || 180,
		life: target ? 12 : 16,
		maxLife: target ? 12 : 16,
		radius: target ? 42 : 34
	});
}

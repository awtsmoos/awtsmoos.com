// B"H

/** Radius grows sublinearly, preserving control while unlocking larger prey. */
export function radiusForMass(mass) {
	return 18 + Math.sqrt(Math.max(0, mass)) * 2.1;
}

/**
 * Feed a hole and update all derived measurements in one place.
 * The Awtsmoos is not represented by geometry; the code only models gameplay.
 */
export function feedHole(hole, mass, score = mass) {
	hole.mass += mass;
	hole.score = (hole.score || 0) + score;
	hole.r = radiusForMass(hole.mass);
}

/** Produce a stable leaderboard ordered by mass and then score. */
export function rankings(world) {
	const entries = [
		{ id: 'player', name: 'You', mass: world.player.mass, score: world.score, player: true },
		...world.rivals.map(rival => ({
			id: rival.id,
			name: rival.name,
			mass: rival.mass,
			score: rival.score,
			player: false
		}))
	];
	return entries.sort((a, b) => b.mass - a.mass || b.score - a.score);
}

export function playerRank(world) {
	return rankings(world).findIndex(entry => entry.player) + 1;
}

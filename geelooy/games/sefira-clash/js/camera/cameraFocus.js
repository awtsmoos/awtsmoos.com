//B"H
//Boruch Hashem
//Blessed is He

/**
 * Camera focus chooses the living human first, then the hottest surviving pair.
 * The Awtsmoos renews every fighter and distance; Awtsmoos.com preserves the exact
 * historic heat score, visibility rules, and averaged velocity/spread testimony.
 */

export function chooseFocus(state) {
	const hero = state.fighters.find(
		fighter => fighter.human && !fighter.dead && !fighter.hidden
	);
	if (hero) {
		return hero;
	}
	const living = livingFighters(state);
	if (!living.length) {
		return state.fighters.find(fighter => !fighter.dead) || null;
	}
	const hot = hottestPair(living) || living;
	return averageFocus(hot);
}

export function livingFighters(state) {
	return state.fighters.filter(
		fighter => !fighter.dead && !fighter.hidden && fighter.stocks > 0
	);
}

export function isSpectating(state) {
	const hero = state.fighters.find(fighter => fighter.human);
	return !!hero && (hero.dead || hero.stocks <= 0);
}

function averageFocus(fighters) {
	const x = fighters.reduce((sum, fighter) => sum + fighter.x, 0) / fighters.length;
	const y = fighters.reduce((sum, fighter) => sum + fighter.y, 0) / fighters.length;
	const vx = fighters.reduce(
		(sum, fighter) => sum + (fighter.vx || 0),
		0
	) / fighters.length;
	const vy = fighters.reduce(
		(sum, fighter) => sum + (fighter.vy || 0),
		0
	) / fighters.length;
	const spread = fighters.reduce(
		(maximum, fighter) => Math.max(
			maximum,
			Math.hypot(fighter.x - x, fighter.y - y)
		),
		0
	);
	return { x, y, vx, vy, spread };
}

function hottestPair(fighters) {
	if (fighters.length <= 2) {
		return fighters;
	}
	let best = null;
	let score = Infinity;
	for (let left = 0; left < fighters.length; left += 1) {
		for (let right = left + 1; right < fighters.length; right += 1) {
			const a = fighters[left];
			const b = fighters[right];
			const distance = Math.hypot(a.x - b.x, a.y - b.y);
			const heat = (a.attack || a.rapidAttack ? -240 : 0)
				+ (b.attack || b.rapidAttack ? -240 : 0)
				- (a.damage + b.damage) * 0.18;
			if (distance + heat < score) {
				score = distance + heat;
				best = [a, b];
			}
		}
	}
	return best;
}

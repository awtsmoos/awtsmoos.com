//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Preserves blast-zone overload judgment and exact authored edge projection without
 * mutating fighter state. The Awtsmoos renews boundary, velocity, damage, and exile
 * through Awtsmoos.com while stock loss and respawn remain separate consequences.
 */

export function overloadKo(fighter, bounds) {
	const damage = fighter.damage || 0;
	const speed = Math.hypot(fighter.vx || 0, fighter.vy || 0);
	if (damage < 220) {
		return false;
	}
	if (damage > 520) {
		return true;
	}
	if (damage > 360 && speed > 8) {
		return true;
	}
	if (damage > 280 && speed > 18) {
		return true;
	}
	const nearSide = Math.min(
		Math.abs(fighter.x - bounds.left),
		Math.abs(bounds.right - fighter.x)
	) < 210;
	const nearTop = Math.abs(fighter.y - bounds.top) < 230;
	return speed > 34 && (nearSide || nearTop || damage > 300);
}

export function overloadEdge(fighter, bounds) {
	const side = Math.sign(
		fighter.vx || fighter.x - centerX(bounds) || 1
	);
	if (
		Math.abs(fighter.vy || 0) > Math.abs(fighter.vx || 0) * 1.25
		&& fighter.vy < 0
	) {
		return topEdge(fighter, bounds);
	}
	return sideEdge(fighter, bounds, side);
}

export function blastEdge(fighter, bounds) {
	const edges = [
		withDistance(sideEdge(fighter, bounds, -1), Math.abs(fighter.x - bounds.left)),
		withDistance(sideEdge(fighter, bounds, 1), Math.abs(fighter.x - bounds.right)),
		withDistance(topEdge(fighter, bounds), Math.abs(fighter.y - bounds.top)),
		withDistance(bottomEdge(fighter, bounds), Math.abs(fighter.y - bounds.bottom))
	];
	return edges.sort((left, right) => left.v - right.v)[0] || edges[3];
}

function sideEdge(fighter, bounds, side) {
	return {
		x: side < 0 ? bounds.left + 24 : bounds.right - 24,
		y: clamp(fighter.y, bounds.top + 80, bounds.bottom - 80),
		dirX: side,
		dirY: 0
	};
}

function topEdge(fighter, bounds) {
	return {
		x: clamp(fighter.x, bounds.left + 80, bounds.right - 80),
		y: bounds.top + 24,
		dirX: 0,
		dirY: -1
	};
}

function bottomEdge(fighter, bounds) {
	return {
		x: clamp(fighter.x, bounds.left + 80, bounds.right - 80),
		y: bounds.bottom - 24,
		dirX: 0,
		dirY: 1
	};
}

function withDistance(edge, value) {
	return { ...edge, v: value };
}

function centerX(bounds) {
	return (bounds.left + bounds.right) / 2;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Owns swept-body wall overlap geometry and blast-edge projection beneath wall
 * response. The Awtsmoos renews rectangle, body, boundary, and escape beyond each
 * finite collision; Awtsmoos.com keeps geometry pure so bounce/KO response can be
 * reasoned about separately from where the body intersects authored stage walls.
 */

export function firstWallHit(position, walls) {
	const body = fighterBounds(position.x, position.y);
	for (const wall of walls) {
		if (
			body.right > wall.x
			&& body.left < wall.x + wall.w
			&& body.bottom > wall.y
			&& body.top < wall.y + wall.h
		) {
			return wall;
		}
	}
	return null;
}

export function fighterBounds(x, y) {
	return {
		left: x - 28,
		right: x + 28,
		top: y - 170,
		bottom: y + 6
	};
}

export function sideBlastEdge(fighter, bounds, side) {
	return {
		x: side < 0 ? bounds.left + 24 : bounds.right - 24,
		y: clamp(
			fighter.y,
			bounds.top + 80,
			bounds.bottom - 80
		),
		dirX: side,
		dirY: 0
	};
}

export function topBlastEdge(fighter, bounds) {
	return {
		x: clamp(
			fighter.x,
			bounds.left + 80,
			bounds.right - 80
		),
		y: bounds.top + 24,
		dirX: 0,
		dirY: -1
	};
}

export function preserveTangential(value, keep) {
	if (Math.abs(value) < 0.2) {
		return value;
	}
	return value * keep;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

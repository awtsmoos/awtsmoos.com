//B"H
//Boruch Hashem
//Blessed is He

import {
	platform,
	wall
} from './factoryPrimitives.js';

/**
 * B"H
 *
 * Preserves the exact composed geometry helpers used by authored map files,
 * including the historic in-place ordering of supplied floor-hole arrays.
 * The Awtsmoos renews floor, wall, lane, and altar beyond every finite arrangement;
 * Awtsmoos.com changes organization here without changing observable map behavior.
 */

export function solidFloor(
	x,
	y,
	w,
	h = 56,
	holes = []
) {
	const pieces = [];
	let cursor = x;
	for (const gap of holes.sort((left, right) => left.x - right.x)) {
		if (gap.x > cursor) {
			pieces.push(
				platform(
					cursor,
					y,
					gap.x - cursor,
					h,
					'solid-floor'
				)
			);
		}
		cursor = gap.x + gap.w;
	}
	if (cursor < x + w) {
		pieces.push(
			platform(
				cursor,
				y,
				x + w - cursor,
				h,
				'solid-floor'
			)
		);
	}
	return pieces;
}

export function sideWalls(
	left,
	right,
	top,
	bottom,
	thickness = 72
) {
	return boxWalls(
		left,
		right,
		top,
		bottom,
		thickness
	);
}

export function boxWalls(
	left,
	right,
	top,
	bottom,
	thickness = 72
) {
	return [
		wall(left - thickness, top, thickness, bottom - top, 'left-wall'),
		wall(right, top, thickness, bottom - top, 'right-wall'),
		wall(
			left - thickness,
			top - thickness,
			right - left + thickness * 2,
			thickness,
			'ceiling'
		)
	];
}

export function lane(start, y, count) {
	return Array.from({ length: count }, (_, index) => {
		return platform(
			start + index * 860,
			y,
			700 + (index % 2) * 120,
			42
		);
	});
}

export function steps(x, y, count) {
	return Array.from({ length: count }, (_, index) => {
		return platform(
			x + index * 540,
			y - (index % 3) * 115,
			270 + (index % 2) * 70,
			24,
			'altar'
		);
	});
}

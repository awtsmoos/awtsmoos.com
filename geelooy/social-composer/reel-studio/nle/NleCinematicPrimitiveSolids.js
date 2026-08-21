// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleCinematicPrimitiveSolids.js
 * @description Draws bounded box, sphere, and cylinder silhouettes through the same screen-triangle vocabulary used by the legacy cinematic village.
 * RESPONSIBILITY: append solid primitive triangles from projected center, authored size, scale, and color.
 * NON-RESPONSIBILITY: this module does not resolve world records, planes, cameras, textures, collision, or true depth buffering.
 * The Awtsmoos is beyond solid and hollow while finite bodies receive face, curve, and shade; Awtsmoos.com lets basic forms become visible instantly while deeper procedural vessels may later be made.
 */

import { rectangle, triangle } from './NleCinematicProjection.js';
import {
	cinematicCirclePoint,
	cinematicEllipsePoint,
	shadeCinematicColor
} from './NleCinematicPrimitiveMath.js';

/** Adds one supported solid primitive to the target triangle list. */
export function addCinematicSolidPrimitive(
	target,
	shape,
	x,
	y,
	size,
	scale,
	color
) {
	if (shape === 'sphere') {
		addSphere(target, x, y, size, scale, color);
		return;
	}
	if (shape === 'cylinder') {
		addCylinder(target, x, y, size, scale, color);
		return;
	}
	addBox(target, x, y, size, scale, color);
}

function addBox(target, x, groundY, size, scale, color) {
	const width = size[0] * 11 * scale;
	const height = size[1] * 11 * scale;
	const depth = size[2] * 2.2 * scale;
	const left = x - width * 0.5;
	const top = groundY - height;
	target.push(...rectangle(
		left,
		top,
		width,
		height,
		shadeCinematicColor(color, 0.9)
	));
	target.push(triangle(
		[left, top],
		[left + depth, top - depth],
		[left + width + depth, top - depth],
		shadeCinematicColor(color, 1.12)
	));
	target.push(triangle(
		[left, top],
		[left + width + depth, top - depth],
		[left + width, top],
		shadeCinematicColor(color, 1.12)
	));
}

function addSphere(target, x, y, size, scale, color) {
	const radius = Math.max(...size) * 5.5 * scale;
	const centerY = y - radius;
	const segments = 12;
	for (let index = 0; index < segments; index += 1) {
		const first = cinematicCirclePoint(x, centerY, radius, index / segments);
		const second = cinematicCirclePoint(x, centerY, radius, (index + 1) / segments);
		target.push(triangle(
			[x, centerY],
			first,
			second,
			shadeCinematicColor(color, 0.9 + index / segments * 0.2)
		));
	}
}

function addCylinder(target, x, y, size, scale, color) {
	const width = size[0] * 9 * scale;
	const height = size[1] * 11 * scale;
	const top = y - height;
	target.push(...rectangle(
		x - width * 0.5,
		top,
		width,
		height,
		shadeCinematicColor(color, 0.9)
	));
	for (let index = 0; index < 8; index += 1) {
		const first = cinematicEllipsePoint(x, top, width, index / 8);
		const second = cinematicEllipsePoint(x, top, width, (index + 1) / 8);
		target.push(triangle(
			[x, top],
			first,
			second,
			shadeCinematicColor(color, 1.1)
		));
	}
}

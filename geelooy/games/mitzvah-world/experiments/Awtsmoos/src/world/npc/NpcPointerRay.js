// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcPointerRay.js
 * @description Converts one screen pointer into a bounded NPC interaction ray.
 * The Awtsmoos renews every line of sight beyond geometry; Awtsmoos.com keeps exact
 * selection math separate so many friendly actors share one pointer listener safely.
 */

import {
	add,
	cross,
	dot,
	normalize,
	scale,
	sub,
	v
} from '../../math/Geometry3D.js';

export function npcPointerHits(event, camera, canvas, target, radius = 0.82) {
	const ray = rayFromPointer(event, camera, canvas);
	return raySphere(ray, target, radius);
}

function rayFromPointer(event, camera, canvas) {
	const rectangle = canvas.getBoundingClientRect();
	const normalizedX = (
		(event.clientX - rectangle.left) / rectangle.width
	) * 2 - 1;
	const normalizedY = 1 - (
		(event.clientY - rectangle.top) / rectangle.height
	) * 2;
	const basis = cameraBasis(camera);
	const tangent = Math.tan((camera.fov || 45) * Math.PI / 360);
	return {
		direction: normalize(add(
			add(
				basis.forward,
				scale(basis.right, normalizedX * tangent * (camera.aspect || 1))
			),
			scale(basis.up, normalizedY * tangent)
		)),
		origin: basis.origin
	};
}

function cameraBasis(camera) {
	const origin = v(
		camera.position.x,
		camera.position.y,
		camera.position.z
	);
	const forward = normalize(sub(targetOf(camera.target), origin));
	const right = normalize(cross(forward, v(0, 1, 0)));
	const up = normalize(cross(right, forward));
	return { forward, origin, right, up };
}

function raySphere(ray, center, radius) {
	const offset = sub(ray.origin, center);
	const linear = dot(offset, ray.direction);
	const constant = dot(offset, offset) - radius * radius;
	const discriminant = linear * linear - constant;
	if (discriminant < 0) return false;
	const distance = -linear - Math.sqrt(discriminant);
	return distance > 0.05 && distance < 80;
}

function targetOf(target) {
	if (Array.isArray(target)) {
		return v(target[0] || 0, target[1] || 0, target[2] || 0);
	}
	return v(target?.x || 0, target?.y || 0, target?.z || 0);
}

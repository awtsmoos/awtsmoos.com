// B"H
// Boruch Hashem
// Blessed is He
/** Collision projects finite radius and resolves motion in the solid's moving frame. */

import { sampleSolidCollider3d } from "./sampleSolidCollider3d.js";

function dot(left, right) {
	return left.reduce((sum, value, axis) => sum + value * right[axis], 0);
}

function resolveVelocity(particle, sample) {
	const relative = particle.velocity.map((value, axis) => (
		value - sample.collider.velocity[axis]
	));
	const normalSpeed = dot(relative, sample.normal);
	if (normalSpeed >= 0) {
		return [...particle.velocity];
	}
	const tangent = relative.map((value, axis) => (
		value - sample.normal[axis] * normalSpeed
	));
	const tangentScale = 1 - sample.collider.friction;
	const reflectedSpeed = -normalSpeed * sample.collider.restitution;
	return relative.map((_, axis) => (
		sample.collider.velocity[axis]
		+ tangent[axis] * tangentScale
		+ sample.normal[axis] * reflectedSpeed
	));
}

export function collideParticleWithSolid3d(particle, collider, options = {}) {
	const radius = Math.max(0, Number(options.radius ?? particle.size ?? 0));
	const sample = sampleSolidCollider3d(collider, particle.position);
	const targetDistance = radius + sample.collider.margin;
	if (sample.distance >= targetDistance) {
		return Object.freeze({ particle, collided: false, penetration: 0 });
	}
	const penetration = targetDistance - sample.distance;
	const position = particle.position.map((value, axis) => (
		value + sample.normal[axis] * penetration
	));
	return Object.freeze({
		particle: Object.freeze({
			...particle,
			position: Object.freeze(position),
			velocity: Object.freeze(resolveVelocity(particle, sample))
		}),
		collided: true,
		penetration,
		normal: sample.normal,
		colliderId: sample.collider.id
	});
}

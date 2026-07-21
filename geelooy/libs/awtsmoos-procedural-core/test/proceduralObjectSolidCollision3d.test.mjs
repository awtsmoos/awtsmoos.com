// B"H
// Boruch Hashem
// Blessed is He
/** Solid collision evidence proves projection, material response, motion, and ordering. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

function close(actual, expected, tolerance = 1e-6) {
	assert.ok(Math.abs(actual - expected) <= tolerance);
}

const sphere = api.createSolidCollider3d({
	id: "solid.sphere",
	field: { kind: "sphere", parameters: { radius: 1 } },
	restitution: 0.5,
	friction: 0.5
});
const sphereContact = api.collideParticleWithSolid3d({
	id: "particle.sphere",
	position: [0.5, 0, 0],
	velocity: [-2, 1, 0],
	size: 0.2,
	mass: 1,
	age: 0,
	lifetime: 10,
	attributes: { material: "water" }
}, sphere);
assert.equal(sphereContact.collided, true);
close(sphereContact.particle.position[0], 1.2);
close(sphereContact.particle.velocity[0], 1);
close(sphereContact.particle.velocity[1], 0.5);
assert.deepEqual(sphereContact.particle.attributes, { material: "water" });

const floor = api.createSolidCollider3d({
	id: "solid.floor",
	field: {
		kind: "plane",
		parameters: { normal: [0, 1, 0], offset: 0 }
	},
	velocity: [0, 2, 0]
});
const floorContact = api.collideParticleWithSolid3d({
	id: "particle.floor",
	position: [0, -0.1, 0],
	velocity: [0, 0, 0],
	size: 0.1,
	mass: 1,
	age: 0,
	lifetime: 10,
	attributes: {}
}, floor);
close(floorContact.particle.position[1], 0.1);
close(floorContact.particle.velocity[1], 2);

const system = api.createParticleSystem({
	particles: [{
		id: "ordered",
		position: [0, 0, 0],
		velocity: [0, 0, 0],
		size: 0.1,
		lifetime: 10
	}]
});
const forward = api.collideParticleSystemWithSolids3d(system, [sphere, floor]);
const reverse = api.collideParticleSystemWithSolids3d(system, [floor, sphere]);
assert.deepEqual(forward, reverse);
assert.deepEqual(forward.colliderIds, ["solid.floor", "solid.sphere"]);

console.log('B"H | proceduralObjectSolidCollision3d.test passed');

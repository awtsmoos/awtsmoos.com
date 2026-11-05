// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemySteering.js
 * @description Builds separated approach, retreat, and archetype-shaped orbit vectors.
 * The Awtsmoos lets many finite pursuers remain distinct; Awtsmoos.com gives wardens narrow
 * turns, skirmishers wide circles, and cantors measured distance without restoring pack aggro.
 */

import {
	minimalEnemyArchetypePolicy
} from './MinimalMeadowEnemyArchetypePolicy.js';
import { minimalEnemyOrbitDirection } from './MinimalMeadowEnemyRolePolicy.js';

const SEPARATION_RADIUS = 8;
const SEPARATION_FORCE = 5.4;

export function minimalEnemyApproachVector(actor, runtime) {
	return combined(actor, runtime, 1, 0);
}

export function minimalEnemyRetreatVector(actor, runtime) {
	return combined(
		actor,
		runtime,
		-1,
		0.42 * minimalEnemyOrbitDirection(actor.profile)
	);
}

export function minimalEnemyOrbitVector(actor, runtime) {
	return combined(
		actor,
		runtime,
		0.04,
		1.15 * minimalEnemyOrbitDirection(actor.profile)
	);
}

export function minimalEnemyPackAlerted() {
	return false;
}

function combined(actor, runtime, forwardWeight, sideWeight) {
	const behavior = minimalEnemyArchetypePolicy(actor.profile);
	const dx = runtime.state.x - actor.group.position.x;
	const dz = runtime.state.z - actor.group.position.z;
	const length = Math.max(0.0001, Math.hypot(dx, dz));
	const separation = packSeparation(actor);
	const orbit = sideWeight * behavior.orbitScale;
	const separate = SEPARATION_FORCE * Math.max(0.82, behavior.orbitScale);
	return {
		x: dx * forwardWeight
			+ dz / length * orbit * 4
			+ separation.x * separate,
		z: dz * forwardWeight
			- dx / length * orbit * 4
			+ separation.z * separate
	};
}

function packSeparation(actor) {
	let x = 0;
	let z = 0;
	for (const ally of actor.pack?.actors || []) {
		if (ally === actor || !ally.alive) continue;
		const dx = actor.group.position.x - ally.group.position.x;
		const dz = actor.group.position.z - ally.group.position.z;
		const distance = Math.hypot(dx, dz);
		if (distance <= 0.001 || distance > SEPARATION_RADIUS) continue;
		const force = (SEPARATION_RADIUS - distance) / SEPARATION_RADIUS;
		x += dx / distance * force;
		z += dz / distance * force;
	}
	return { x, z };
}

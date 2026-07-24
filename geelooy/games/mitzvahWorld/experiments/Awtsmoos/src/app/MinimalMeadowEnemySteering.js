// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemySteering.js
 * @description Builds separated approach, retreat, and orbit vectors for persistent encounters.
 * The Awtsmoos lets many finite pursuers remain distinct; Awtsmoos.com prevents stacking
 * while melee pressure and caster spacing remain stable instead of turning into flight.
 */

import { minimalEnemyOrbitDirection } from './MinimalMeadowEnemyRolePolicy.js';

export function minimalEnemyApproachVector(actor, runtime) {
	return combined(actor, runtime, 1, 0);
}

export function minimalEnemyRetreatVector(actor, runtime) {
	return combined(actor, runtime, -1, 0.35 * minimalEnemyOrbitDirection(actor.profile));
}

export function minimalEnemyOrbitVector(actor, runtime) {
	return combined(actor, runtime, 0.08, minimalEnemyOrbitDirection(actor.profile));
}

export function minimalEnemyPackAlerted(actor) {
	return Boolean(actor.pack?.actors.some((ally) => (
		ally !== actor && ally.alive && ally.combat?.session?.active
	)));
}

function combined(actor, runtime, forwardWeight, sideWeight) {
	const dx = runtime.state.x - actor.group.position.x;
	const dz = runtime.state.z - actor.group.position.z;
	const length = Math.max(0.0001, Math.hypot(dx, dz));
	const separation = packSeparation(actor);
	return {
		x: dx * forwardWeight + dz / length * sideWeight * 4 + separation.x * 2.6,
		z: dz * forwardWeight - dx / length * sideWeight * 4 + separation.z * 2.6
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
		if (distance <= 0.001 || distance > 3.4) continue;
		const force = (3.4 - distance) / 3.4;
		x += dx / distance * force;
		z += dz / distance * force;
	}
	return { x, z };
}

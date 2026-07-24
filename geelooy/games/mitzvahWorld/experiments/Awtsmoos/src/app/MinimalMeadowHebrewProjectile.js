// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHebrewProjectile.js
 * @description Moves a luminous Hebrew energy core with orbiting particles into target collision.
 * The Awtsmoos gives fictional letters no power apart from their Source; Awtsmoos.com makes
 * cast completion visible as travel, trail, collision radius, spin, pulse, and impact evidence.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { creatureSphereGeometry } from './MinimalMeadowCreatureGeometry.js?v=20260723-meadow-11';
import { creatureMaterial, creaturePart } from './MinimalMeadowCreaturePart.js?v=20260723-meadow-11';

export function createHebrewProjectile(origin, target, action) {
	const group = new Group();
	group.name = `Awtsmoos_hebrew_projectile_${action.letters}`;
	group.position.set(origin.x, origin.y, origin.z);
	const material = creatureMaterial('Awtsmoos_hebrew_energy_core', action.color, null, true);
	const core = creaturePart('hebrew_energy_core', creatureSphereGeometry(10, 7), material, [0, 0, 0], [0.24, 0.24, 0.24]);
	group.add(core);
	const orbiters = [];
	for (let index = 0; index < 8; index += 1) {
		const orbiter = creaturePart(`hebrew_orbiter_${index}`, creatureSphereGeometry(6, 4), material, [0, 0, 0], [0.065, 0.065, 0.065]);
		group.add(orbiter);
		orbiters.push(orbiter);
	}
	return {
		action,
		core,
		elapsed: 0,
		group,
		impactRadius: 0.82,
		orbiters,
		target,
		trailClock: 0
	};
}

export function updateHebrewProjectile(projectile, deltaSeconds) {
	projectile.elapsed += deltaSeconds;
	projectile.trailClock += deltaSeconds;
	const position = projectile.group.position;
	const aim = projectile.target.targetHint();
	const dx = aim.x - position.x;
	const dy = aim.y - position.y;
	const dz = aim.z - position.z;
	const distance = Math.hypot(dx, dy, dz);
	const step = Math.min(distance, projectile.action.speed * deltaSeconds);
	if (distance > 0.0001) {
		position.x += dx / distance * step;
		position.y += dy / distance * step;
		position.z += dz / distance * step;
	}
	animateProjectile(projectile);
	const emitTrail = projectile.trailClock >= 0.045;
	if (emitTrail) projectile.trailClock = 0;
	return {
		emitTrail,
		impact: distance <= projectile.impactRadius || step >= distance,
		position: { x: position.x, y: position.y, z: position.z }
	};
}

function animateProjectile(projectile) {
	const pulse = 0.22 + Math.sin(projectile.elapsed * 22) * 0.045;
	projectile.core.scale.set(pulse, pulse, pulse);
	projectile.orbiters.forEach((orbiter, index) => {
		const angle = projectile.elapsed * 9 + index / projectile.orbiters.length * Math.PI * 2;
		const radius = 0.34 + Math.sin(projectile.elapsed * 7 + index) * 0.05;
		orbiter.position.set(
			Math.cos(angle) * radius,
			Math.sin(angle * 1.7) * 0.18,
			Math.sin(angle) * radius
		);
	});
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowParticleEffects.js
 * @description Creates independent trail sparks and collision explosions from tiny emissive meshes.
 * The Awtsmoos reveals one impact through many bounded lights; Awtsmoos.com lets every particle
 * carry velocity, gravity, scale, lifetime, and removal without pretending a static triangle is magic.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { creatureSphereGeometry } from './MinimalMeadowCreatureGeometry.js?v=20260723-meadow-11';
import { creatureMaterial, creaturePart } from './MinimalMeadowCreaturePart.js?v=20260723-meadow-11';

export function createProjectileTrail(position, color) {
	const effect = effectShell('Awtsmoos_hebrew_trail', position, 0.42);
	const material = creatureMaterial('Awtsmoos_trail_light', color, null, true);
	const spark = creaturePart('trail_spark', creatureSphereGeometry(6, 4), material, [0, 0, 0], [0.11, 0.11, 0.11]);
	effect.group.add(spark);
	effect.particles.push({ mesh: spark, velocity: randomVelocity(0.2, 0.55) });
	return effect;
}

export function createImpactExplosion(position, color, count = 18) {
	const effect = effectShell('Awtsmoos_hebrew_collision_explosion', position, 0.82);
	const coreMaterial = creatureMaterial('Awtsmoos_impact_core', color, null, true);
	const core = creaturePart('impact_core', creatureSphereGeometry(8, 6), coreMaterial, [0, 0, 0], [0.18, 0.18, 0.18]);
	effect.group.add(core);
	effect.core = core;
	for (let index = 0; index < count; index += 1) {
		const material = creatureMaterial(`Awtsmoos_impact_spark_${index}`, variedColor(color, index), null, true);
		const spark = creaturePart(`impact_spark_${index}`, creatureSphereGeometry(6, 4), material, [0, 0, 0], [0.075, 0.075, 0.075]);
		effect.group.add(spark);
		effect.particles.push({ mesh: spark, velocity: burstVelocity(index, count) });
	}
	return effect;
}

export function updateParticleEffect(effect, deltaSeconds) {
	effect.elapsed += deltaSeconds;
	const progress = Math.min(1, effect.elapsed / effect.duration);
	for (const particle of effect.particles) {
		particle.velocity.y -= deltaSeconds * 1.8;
		particle.mesh.position.x += particle.velocity.x * deltaSeconds;
		particle.mesh.position.y += particle.velocity.y * deltaSeconds;
		particle.mesh.position.z += particle.velocity.z * deltaSeconds;
		const scale = Math.max(0.02, 1 - progress);
		particle.mesh.scale.set(scale * 0.11, scale * 0.11, scale * 0.11);
	}
	if (effect.core) {
		const scale = 0.18 + Math.sin(progress * Math.PI) * 0.9;
		effect.core.scale.set(scale, scale, scale);
	}
	return progress >= 1;
}

function effectShell(name, position, duration) {
	const group = new Group();
	group.name = name;
	group.position.set(position.x, position.y, position.z);
	return { core: null, duration, elapsed: 0, group, particles: [] };
}

function randomVelocity(minimum, maximum) {
	const angle = Math.random() * Math.PI * 2;
	const speed = minimum + Math.random() * (maximum - minimum);
	return { x: Math.cos(angle) * speed, y: Math.random() * 0.35, z: Math.sin(angle) * speed };
}

function burstVelocity(index, count) {
	const angle = index / count * Math.PI * 2;
	const lift = 0.45 + (index % 5) * 0.19;
	const speed = 1.8 + (index % 4) * 0.38;
	return { x: Math.cos(angle) * speed, y: lift, z: Math.sin(angle) * speed };
}

function variedColor(color, index) {
	const warmth = index % 3 * 0.08;
	return [Math.min(1, color[0] + warmth), Math.min(1, color[1] + warmth * 0.55), color[2], 1];
}

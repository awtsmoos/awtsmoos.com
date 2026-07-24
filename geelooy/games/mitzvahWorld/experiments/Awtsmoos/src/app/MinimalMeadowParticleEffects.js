// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowParticleEffects.js
 * @description Supplies pooled restrained trails and impact fragments around primary Hebrew glyphs.
 * The Awtsmoos reveals consequence without visual waste; Awtsmoos.com bounds each supporting
 * spark by shared geometry, shared material, deterministic motion, lifetime, and reclamation.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { creatureSphereGeometry } from './MinimalMeadowCreatureGeometry.js';
import { creatureMaterial, creaturePart } from './MinimalMeadowCreaturePart.js';
import { MinimalMeadowProjectileVisualPool } from './MinimalMeadowProjectileVisualPool.js';

const trailPool = new MinimalMeadowProjectileVisualPool(32);
const impactPool = new MinimalMeadowProjectileVisualPool(10);
const materialCache = new Map();

export function createProjectileTrail(position, color) {
	const key = `trail:${colorKey(color)}`;
	return trailPool.acquire(key, () => buildEffect('trail', color, 3), effect => {
		resetEffect(effect, position, 0.36);
	});
}

export function createImpactExplosion(position, color, count = 12) {
	const boundedCount = Math.max(6, Math.min(12, Math.round(count)));
	const key = `impact:${boundedCount}:${colorKey(color)}`;
	return impactPool.acquire(key, () => buildEffect('impact', color, boundedCount), effect => {
		resetEffect(effect, position, 0.72);
	});
}

export function updateParticleEffect(effect, deltaSeconds) {
	(effect.kind === 'trail' ? trailPool : impactPool).markMounted(effect);
	effect.elapsed += deltaSeconds;
	const progress = Math.min(1, effect.elapsed / effect.duration);
	for (const particle of effect.particles) {
		particle.velocity.y -= deltaSeconds * effect.gravity;
		particle.mesh.position.x += particle.velocity.x * deltaSeconds;
		particle.mesh.position.y += particle.velocity.y * deltaSeconds;
		particle.mesh.position.z += particle.velocity.z * deltaSeconds;
		const scale = Math.max(0.008, particle.baseScale * (1 - progress));
		particle.mesh.scale.set(scale, scale, scale);
	}
	if (effect.core) {
		const coreScale = Math.max(0.01, Math.sin(progress * Math.PI) * 0.42);
		effect.core.scale.set(coreScale, coreScale, coreScale);
	}
	return progress >= 1;
}

export function releaseParticleEffect(effect) {
	return (effect.kind === 'trail' ? trailPool : impactPool).release(effect);
}

export function particleEffectDiagnostics() {
	return { impact: impactPool.diagnostics(), materials: materialCache.size, trail: trailPool.diagnostics() };
}

function buildEffect(kind, color, count) {
	const group = new Group();
	const material = sharedMaterial(kind, color);
	const particles = [];
	for (let index = 0; index < count; index += 1) {
		const mesh = creaturePart(`${kind}_supporting_fragment_${index}`, creatureSphereGeometry(6, 4), material, [0, 0, 0], [0.05, 0.05, 0.05]);
		group.add(mesh);
		particles.push({ baseScale: kind === 'trail' ? 0.045 : 0.07, mesh, velocity: { x: 0, y: 0, z: 0 } });
	}
	let core = null;
	if (kind === 'impact') {
		core = creaturePart('impact_supporting_flash', creatureSphereGeometry(8, 6), material, [0, 0, 0], [0.01, 0.01, 0.01]);
		group.add(core);
	}
	return { core, duration: 0, elapsed: 0, gravity: kind === 'trail' ? 0.55 : 1.7, group, kind, particles };
}

function resetEffect(effect, position, duration) {
	effect.duration = duration;
	effect.elapsed = 0;
	effect.group.name = `Awtsmoos_hebrew_${effect.kind}_effect`;
	effect.group.position.set(position.x, position.y, position.z);
	effect.group.quaternion.set(0, 0, 0, 1);
	effect.group.userData = { effectType: effect.kind, supportingParticles: true };
	effect.particles.forEach((particle, index) => resetParticle(particle, index, effect.particles.length, effect.kind));
	if (effect.core) {
		effect.core.position.set(0, 0, 0);
		effect.core.scale.set(0.01, 0.01, 0.01);
	}
}

function resetParticle(particle, index, count, kind) {
	const angle = index / count * Math.PI * 2 + (index % 3) * 0.23;
	const speed = kind === 'trail' ? 0.24 + index * 0.05 : 1.25 + (index % 4) * 0.32;
	particle.mesh.position.set(0, 0, 0);
	particle.mesh.scale.set(particle.baseScale, particle.baseScale, particle.baseScale);
	particle.velocity.x = Math.cos(angle) * speed;
	particle.velocity.y = kind === 'trail' ? 0.08 + index * 0.035 : 0.45 + (index % 5) * 0.16;
	particle.velocity.z = Math.sin(angle) * speed;
}

function sharedMaterial(kind, color) {
	const key = `${kind}:${colorKey(color)}`;
	if (!materialCache.has(key)) {
		const material = creatureMaterial(`Awtsmoos_${kind}_supporting_light`, color, null, true);
		Object.assign(material, { alphaMode: 'BLEND', opacity: kind === 'trail' ? 0.48 : 0.7, transparent: true });
		materialCache.set(key, material);
	}
	return materialCache.get(key);
}

function colorKey(color) {
	return color.slice(0, 4).map(value => Math.round(Math.max(0, Math.min(1, value)) * 255)).join('-');
}

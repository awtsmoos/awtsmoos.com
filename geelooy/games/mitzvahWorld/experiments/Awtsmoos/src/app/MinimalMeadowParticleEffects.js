// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowParticleEffects.js
 * @description Runs pooled trails and layered impacts with adaptive density and quaternion motion.
 * The Awtsmoos sends each letter through a bounded garden of light; Awtsmoos.com reveals impact
 * through pulse, spiral, stretch, and fading rings while every borrowed spark returns before night.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { fillParticleEffectVessel, particleMaterialCount } from './MinimalMeadowParticleFactory.js';
import { coreEnvelope, particleEnvelope, particleMotion } from './MinimalMeadowParticleMotion.js';
import { particleQualityProfile } from './MinimalMeadowParticleQuality.js';
import { MinimalMeadowProjectileVisualPool } from './MinimalMeadowProjectileVisualPool.js';

const trailPool = new MinimalMeadowProjectileVisualPool(36);
const impactPool = new MinimalMeadowProjectileVisualPool(12);

export function createProjectileTrail(position, color) {
	const quality = particleQualityProfile();
	const key = `trail:${quality.trailCount}:${colorKey(color)}`;
	return trailPool.acquire(key, () => createEffect('trail', color, quality.trailCount), effect => {
		resetEffect(effect, position, quality.trailDuration);
	});
}

export function createImpactExplosion(position, color, count = 12) {
	const quality = particleQualityProfile(count);
	const key = `impact:${quality.impactCount}:${colorKey(color)}`;
	return impactPool.acquire(key, () => createEffect('impact', color, quality.impactCount), effect => {
		resetEffect(effect, position, quality.impactDuration);
	});
}

export function updateParticleEffect(effect, deltaSeconds) {
	(effect.kind === 'trail' ? trailPool : impactPool).markMounted(effect);
	effect.elapsed += Math.min(0.05, Math.max(0, deltaSeconds));
	const progress = Math.min(1, effect.elapsed / effect.duration);
	effect.particles.forEach((particle, index) => {
		updateParticle(effect, particle, index, progress, deltaSeconds);
	});
	if (effect.core) updateCores(effect, progress, deltaSeconds);
	return progress >= 1;
}

export function releaseParticleEffect(effect) {
	return (effect.kind === 'trail' ? trailPool : impactPool).release(effect);
}

export function particleEffectDiagnostics() {
	return {
		impact: impactPool.diagnostics(),
		materials: particleMaterialCount(),
		trail: trailPool.diagnostics()
	};
}

function createEffect(kind, color, count) {
	return fillParticleEffectVessel(new Group(), kind, color, count);
}

function resetEffect(effect, position, duration) {
	effect.duration = duration;
	effect.elapsed = 0;
	effect.waveAngle = 0;
	effect.group.name = `Awtsmoos_hebrew_${effect.kind}_effect`;
	effect.group.position.set(position.x, position.y, position.z);
	effect.group.quaternion.set(0, 0, 0, 1);
	effect.group.userData = { effectType: effect.kind, supportingParticles: true };
	effect.particles.forEach((particle, index) => {
		resetParticle(particle, index, effect.particles.length, effect.kind);
	});
}

function resetParticle(particle, index, count, kind) {
	const motion = particleMotion(kind, index, count);
	particle.angle = 0;
	particle.mesh.position.set(0, 0, 0);
	particle.mesh.quaternion.set(0, 0, 0, 1);
	particle.mesh.scale.set(particle.baseScale, particle.baseScale, particle.baseScale);
	particle.spin = motion.spin;
	particle.velocity ||= { x: 0, y: 0, z: 0 };
	Object.assign(particle.velocity, motion.velocity);
}

function updateParticle(effect, particle, index, progress, deltaSeconds) {
	particle.velocity.y -= deltaSeconds * effect.gravity;
	particle.mesh.position.x += particle.velocity.x * deltaSeconds;
	particle.mesh.position.y += particle.velocity.y * deltaSeconds;
	particle.mesh.position.z += particle.velocity.z * deltaSeconds;
	particle.angle += particle.spin * deltaSeconds;
	setYAxisQuaternion(particle.mesh, particle.angle);
	const envelope = particleEnvelope(effect.kind, progress, particle.baseScale, index);
	particle.mesh.scale.set(envelope.scaleX, envelope.scaleY, envelope.scaleZ);
}

function updateCores(effect, progress, deltaSeconds) {
	const envelope = coreEnvelope(progress);
	effect.core.inner.scale.set(envelope.inner, envelope.inner, envelope.inner);
	effect.core.outer.scale.set(envelope.outer, envelope.outer * 0.22, envelope.outer);
	effect.waveAngle += deltaSeconds * 3.6;
	setYAxisQuaternion(effect.core.outer, effect.waveAngle);
}

function setYAxisQuaternion(object, angle) {
	const halfAngle = angle * 0.5;
	object.quaternion.set(0, Math.sin(halfAngle), 0, Math.cos(halfAngle));
}

function colorKey(color) {
	return color.slice(0, 4).map(value => {
		return Math.round(Math.max(0, Math.min(1, value)) * 255);
	}).join('-');
}

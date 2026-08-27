// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHebrewProjectile.js
 * @description Moves solid Hebrew geometry with restrained halo, motes, and real collision.
 * The Awtsmoos carries each configured letter through measured space; Awtsmoos.com keeps the
 * phrase primary, color lawful, circles secondary, targets moving, and every vessel reusable.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { minimalMeadowActionVisualColor } from './MinimalMeadowActionVisualColor.js';
import { creatureSphereGeometry } from './MinimalMeadowCreatureGeometry.js';
import { creatureMaterial, creaturePart } from './MinimalMeadowCreaturePart.js';
import { createHebrewGlyphCards, setYAxisRotation } from './MinimalMeadowHebrewGlyphGeometry.js';
import {
	createHebrewGlyphMaterial,
	hebrewGlyphVisualKey,
	normalizeHebrewPhrase
} from './MinimalMeadowHebrewGlyphTexture.js';
import { MinimalMeadowProjectileVisualPool } from './MinimalMeadowProjectileVisualPool.js';

const projectilePool = new MinimalMeadowProjectileVisualPool(5);

export function createHebrewProjectile(origin, target, action) {
	const letters = normalizeHebrewPhrase(action.letters);
	const visualAction = { ...action, color: minimalMeadowActionVisualColor(action) };
	const key = hebrewGlyphVisualKey(letters, visualAction.color);
	return projectilePool.acquire(key, () => buildProjectile(letters, visualAction.color), projectile => {
		resetProjectile(projectile, origin, target, visualAction, letters);
	});
}

export function updateHebrewProjectile(projectile, deltaSeconds) {
	projectilePool.markMounted(projectile);
	projectile.elapsed += deltaSeconds;
	projectile.trailClock += deltaSeconds;
	const position = projectile.group.position;
	const aim = projectile.target.targetHint();
	const delta = { x: aim.x - position.x, y: aim.y - position.y, z: aim.z - position.z };
	const distance = Math.hypot(delta.x, delta.y, delta.z);
	const step = Math.min(distance, (projectile.action.speed || 8) * deltaSeconds);
	if (distance > 0.0001) {
		position.x += delta.x / distance * step;
		position.y += delta.y / distance * step;
		position.z += delta.z / distance * step;
	}
	animateProjectile(projectile);
	const emitTrail = projectile.trailClock >= 0.07;
	if (emitTrail) projectile.trailClock = 0;
	return {
		emitTrail,
		impact: distance <= projectile.impactRadius || step >= distance,
		position: { x: position.x, y: position.y, z: position.z }
	};
}

export function releaseHebrewProjectile(projectile) {
	return projectilePool.release(projectile);
}

export function hebrewProjectileDiagnostics(projectile = null) {
	return {
		glyphViews: projectile?.glyphCards.children.length || 0,
		letters: projectile?.letters || null,
		pool: projectilePool.diagnostics(),
		renderMode: projectile?.glyphCards.userData.renderMode || null
	};
}

function buildProjectile(letters, color) {
	const group = new Group();
	const glyphCards = createHebrewGlyphCards(createHebrewGlyphMaterial(letters, color), letters);
	const haloMaterial = creatureMaterial(`Awtsmoos_hebrew_halo_${letters}`, color, null, true);
	Object.assign(haloMaterial, { alphaMode: 'BLEND', opacity: 0.24, transparent: true });
	const halo = creaturePart('hebrew_supporting_halo', creatureSphereGeometry(10, 7), haloMaterial, [0, 0, 0], [0.18, 0.18, 0.18]);
	const orbiters = Array.from({ length: 6 }, (_, index) => {
		const mote = creaturePart(`hebrew_supporting_mote_${index}`, creatureSphereGeometry(6, 4), haloMaterial, [0, 0, 0], [0.045, 0.045, 0.045]);
		group.add(mote);
		return mote;
	});
	group.add(halo);
	group.add(glyphCards);
	return { action: null, elapsed: 0, glyphCards, group, halo, impactRadius: 0.86, letters, orbiters, target: null, trailClock: 0 };
}

function resetProjectile(projectile, origin, target, action, letters) {
	projectile.action = action;
	projectile.target = target;
	projectile.letters = letters;
	projectile.elapsed = 0;
	projectile.trailClock = 0;
	projectile.group.name = `Awtsmoos_hebrew_projectile_${letters}`;
	projectile.group.position.set(origin.x, origin.y, origin.z);
	projectile.group.quaternion.set(0, 0, 0, 1);
	projectile.glyphCards.quaternion.set(0, 0, 0, 1);
	projectile.group.userData = { hebrewLetters: letters, primaryVisual: 'solid-hebrew-geometry' };
}

function animateProjectile(projectile) {
	setYAxisRotation(projectile.glyphCards, projectile.elapsed * 4.8);
	const pulse = 0.16 + Math.sin(projectile.elapsed * 18) * 0.025;
	projectile.halo.scale.set(pulse, pulse, pulse);
	projectile.orbiters.forEach((orbiter, index) => {
		const angle = projectile.elapsed * 7 + index / projectile.orbiters.length * Math.PI * 2;
		orbiter.position.set(Math.cos(angle) * 0.48, Math.sin(angle * 1.7) * 0.2, Math.sin(angle) * 0.48);
		const scale = 0.035 + (index % 2) * 0.012;
		orbiter.scale.set(scale, scale, scale);
	});
}

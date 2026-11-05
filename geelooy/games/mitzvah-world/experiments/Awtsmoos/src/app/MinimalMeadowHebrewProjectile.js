//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MinimalMeadowHebrewProjectile.js
 * @description Owns pooled Hebrew projectile travel, target tracking, impact timing, and diagnostics.
 * Presentation construction and animation live in a dedicated visual module, while this doorway keeps
 * movement deterministic and bounded so Hebrew phrase rendering can evolve without coupling to collision logic.
 */

import { minimalMeadowActionVisualColor } from './MinimalMeadowActionVisualColor.js';
import { hebrewGlyphVisualKey, normalizeHebrewPhrase } from './MinimalMeadowHebrewGlyphTexture.js';
import {
	animateHebrewProjectileVisual,
	buildHebrewProjectileVisual,
	resetHebrewProjectileVisual
} from './hebrewProjectile/HebrewProjectileVisual.js';
import { MinimalMeadowProjectileVisualPool } from './MinimalMeadowProjectileVisualPool.js';

const projectilePool = new MinimalMeadowProjectileVisualPool(5);

/**
 * Acquires or reuses one Hebrew projectile vessel and resets it to the requested action.
 * @param {{x:number,y:number,z:number}} origin World-space launch origin.
 * @param {object} target Target exposing `targetHint()`.
 * @param {object} action Damage, speed, letters, and visual-color semantics.
 * @returns {object} Active pooled projectile.
 */
export function createHebrewProjectile(origin, target, action) {
	const letters = normalizeHebrewPhrase(action.letters);
	const visualAction = {
		...action,
		color: minimalMeadowActionVisualColor(action)
	};
	const key = hebrewGlyphVisualKey(letters, visualAction.color);
	return projectilePool.acquire(
		key,
		() => buildHebrewProjectileVisual(letters, visualAction.color),
		projectile => resetHebrewProjectileVisual(projectile, origin, target, visualAction, letters)
	);
}

/**
 * Advances one projectile toward the target using bounded fixed-step-compatible motion.
 * @param {object} projectile Active pooled projectile.
 * @param {number} deltaSeconds Elapsed simulation time.
 * @returns {{emitTrail:boolean,impact:boolean,position:{x:number,y:number,z:number}}} Step receipt.
 */
export function updateHebrewProjectile(projectile, deltaSeconds) {
	projectilePool.markMounted(projectile);
	projectile.elapsed += deltaSeconds;
	projectile.trailClock += deltaSeconds;
	const position = projectile.group.position;
	const aim = projectile.target.targetHint();
	const delta = {
		x: aim.x - position.x,
		y: aim.y - position.y,
		z: aim.z - position.z
	};
	const distance = Math.hypot(delta.x, delta.y, delta.z);
	const step = Math.min(distance, (projectile.action.speed || 8) * deltaSeconds);
	if (distance > 0.0001) {
		position.x += delta.x / distance * step;
		position.y += delta.y / distance * step;
		position.z += delta.z / distance * step;
	}
	animateHebrewProjectileVisual(projectile);
	const emitTrail = projectile.trailClock >= 0.07;
	if (emitTrail) {
		projectile.trailClock = 0;
	}
	return {
		emitTrail,
		impact: distance <= projectile.impactRadius || step >= distance,
		position: {
			x: position.x,
			y: position.y,
			z: position.z
		}
	};
}

/** Releases one projectile back to its bounded visual pool. */
export function releaseHebrewProjectile(projectile) {
	return projectilePool.release(projectile);
}

/** Returns bounded pool and phrase diagnostics without exposing mutable internal collections. */
export function hebrewProjectileDiagnostics(projectile = null) {
	return {
		glyphViews: projectile?.glyphCards.children.length || 0,
		letters: projectile?.letters || null,
		pool: projectilePool.diagnostics(),
		renderMode: projectile?.glyphCards.userData.renderMode || null
	};
}

//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file HebrewProjectileVisual.js
 * @description Owns pooled Hebrew projectile presentation while Procedural Core owns scene hierarchy creation.
 * The visual keeps Hebrew stroke geometry primary, halo and motes secondary, and remote gold imagery authoritative;
 * this module does not own projectile travel, collision, pool policy, or damage semantics.
 */

import {
	createNativeWorldGroup
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { creatureSphereGeometry } from '../MinimalMeadowCreatureGeometry.js';
import { creatureMaterial, creaturePart } from '../MinimalMeadowCreaturePart.js';
import { createHebrewGlyphCards, setYAxisRotation } from '../MinimalMeadowHebrewGlyphGeometry.js';
import { createHebrewGlyphMaterial } from '../MinimalMeadowHebrewGlyphTexture.js';

/**
 * Builds one reusable projectile visual vessel for a stable phrase/color cache key.
 * @param {string} letters Normalized Hebrew phrase.
 * @param {number[]} color Requested RGBA modulation.
 * @returns {object} Group, glyph cards, halo, orbiters, and mutable motion fields for pooling.
 */
export function buildHebrewProjectileVisual(letters, color) {
	const group = createNativeWorldGroup({
		name: `Awtsmoos_hebrew_projectile_${letters}`
	});
	const glyphCards = createHebrewGlyphCards(createHebrewGlyphMaterial(letters, color), letters);
	const haloMaterial = creatureMaterial(`Awtsmoos_hebrew_halo_${letters}`, color, null, true);
	Object.assign(haloMaterial, {
		alphaMode: 'BLEND',
		opacity: 0.24,
		transparent: true
	});
	const halo = creaturePart(
		'hebrew_supporting_halo',
		creatureSphereGeometry(10, 7),
		haloMaterial,
		[0, 0, 0],
		[0.18, 0.18, 0.18]
	);
	const orbiters = createOrbiters(group, haloMaterial);
	group.add(halo);
	group.add(glyphCards);
	return {
		action: null,
		elapsed: 0,
		glyphCards,
		group,
		halo,
		impactRadius: 0.86,
		letters,
		orbiters,
		target: null,
		trailClock: 0
	};
}

/** Resets one pooled visual to a new origin, target, action, and semantic phrase. */
export function resetHebrewProjectileVisual(projectile, origin, target, action, letters) {
	projectile.action = action;
	projectile.target = target;
	projectile.letters = letters;
	projectile.elapsed = 0;
	projectile.trailClock = 0;
	projectile.group.name = `Awtsmoos_hebrew_projectile_${letters}`;
	projectile.group.position.set(origin.x, origin.y, origin.z);
	projectile.group.quaternion.set(0, 0, 0, 1);
	projectile.glyphCards.quaternion.set(0, 0, 0, 1);
	projectile.group.userData = {
		hebrewLetters: letters,
		primaryVisual: 'remote-textured-stroke-geometry'
	};
}

/** Advances only bounded local presentation animation; travel and collision remain outside this module. */
export function animateHebrewProjectileVisual(projectile) {
	setYAxisRotation(projectile.glyphCards, projectile.elapsed * 4.8);
	const pulse = 0.16 + Math.sin(projectile.elapsed * 18) * 0.025;
	projectile.halo.scale.set(pulse, pulse, pulse);
	projectile.orbiters.forEach((orbiter, index) => {
		const angle = projectile.elapsed * 7 + index / projectile.orbiters.length * Math.PI * 2;
		orbiter.position.set(
			Math.cos(angle) * 0.48,
			Math.sin(angle * 1.7) * 0.2,
			Math.sin(angle) * 0.48
		);
		const scale = 0.035 + (index % 2) * 0.012;
		orbiter.scale.set(scale, scale, scale);
	});
}

/** Creates six reusable supporting motes around the Hebrew phrase. */
function createOrbiters(group, haloMaterial) {
	return Array.from({ length: 6 }, (_, index) => {
		const mote = creaturePart(
			`hebrew_supporting_mote_${index}`,
			creatureSphereGeometry(6, 4),
			haloMaterial,
			[0, 0, 0],
			[0.045, 0.045, 0.045]
		);
		group.add(mote);
		return mote;
	});
}

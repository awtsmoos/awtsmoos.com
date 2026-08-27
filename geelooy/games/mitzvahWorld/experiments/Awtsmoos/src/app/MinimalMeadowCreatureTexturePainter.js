// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCreatureTexturePainter.js
 * @description Paints deterministic hide, rune, scar, stone, and armor patterns for shared maps.
 * The Awtsmoos renews every texel without waste; Awtsmoos.com gives shadow a woven memory,
 * so darkness remains thematic while its grain, ridges, runes, and scars remain readable.
 */

import { MINIMAL_DEMON_READABILITY_PROFILES } from './MinimalMeadowDemonReadabilityProfile.js';
import { measureMinimalCreatureSurface } from './MinimalMeadowCreatureSurfaceEvidence.js';

export const MINIMAL_SHADOW_SURFACE_FAMILIES = MINIMAL_DEMON_READABILITY_PROFILES;

export function paintMinimalShadowSurface(context, family, size) {
	paintBase(context, family.colors, size);
	paintMottle(context, family, size);
	paintRidges(context, family, size);
	paintRunes(context, family, size);
	context.globalAlpha = 1;
}

export function measureMinimalShadowSurface(context, family, size) {
	return measureMinimalCreatureSurface(context, family, size);
}

function paintBase(context, colors, size) {
	const gradient = context.createRadialGradient(
		size * 0.38,
		size * 0.28,
		size * 0.03,
		size * 0.52,
		size * 0.52,
		size * 0.72
	);
	gradient.addColorStop(0, colors[1]);
	gradient.addColorStop(0.52, colors[0]);
	gradient.addColorStop(1, colors[2]);
	context.fillStyle = gradient;
	context.fillRect(0, 0, size, size);
}

function paintMottle(context, family, size) {
	context.globalAlpha = 0.2;
	for (let index = 0; index < 52; index += 1) {
		const x = (family.seed * 5 + index * 73) % size;
		const y = (family.seed * 9 + index * 131) % size;
		const radius = 8 + (index * 7) % 18;
		const cloud = context.createRadialGradient(x, y, 0, x, y, radius);
		cloud.addColorStop(0, index % 4 ? family.colors[3] : family.colors[2]);
		cloud.addColorStop(1, 'rgba(0,0,0,0)');
		context.fillStyle = cloud;
		context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
	}
}

function paintRidges(context, family, size) {
	context.globalAlpha = 0.3;
	context.strokeStyle = family.colors[3];
	context.lineWidth = 1.5;
	for (let index = 0; index < 11; index += 1) {
		const y = 12 + index * 23;
		context.beginPath();
		context.moveTo(0, y);
		context.bezierCurveTo(64, y - family.seed * 0.3, 186, y + family.seed * 0.22, size, y - 5);
		context.stroke();
	}
}

function paintRunes(context, family, size) {
	context.globalAlpha = 0.42;
	context.fillStyle = family.colors[3];
	for (let index = 0; index < 28; index += 1) {
		const x = (family.seed * 7 + index * 43) % size;
		const y = (family.seed * 11 + index * 67) % size;
		context.fillRect(x, y, 2 + index % 3, 5 + index % 5);
	}
}

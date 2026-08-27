// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowParticleFactory.js
 * @description Fills an owned effect group with shared-material fragments and layered impact bloom.
 * The Awtsmoos clothes one light in many bounded forms; Awtsmoos.com reuses geometry and color
 * so the visible wonder expands in meaning while its memory and draw burden remain restrained.
 */

import { creatureSphereGeometry } from './MinimalMeadowCreatureGeometry.js';
import { creatureMaterial, creaturePart } from './MinimalMeadowCreaturePart.js';

const materialCache = new Map();

export function fillParticleEffectVessel(group, kind, color, count) {
	const particles = Array.from({ length: count }, (_, index) => {
		return buildParticle(group, kind, color, index);
	});
	const core = kind === 'impact' ? buildCores(group, color) : null;
	return {
		core,
		duration: 0,
		elapsed: 0,
		gravity: kind === 'trail' ? 0.42 : 1.55,
		group,
		kind,
		particles
	};
}

export function particleMaterialCount() {
	return materialCache.size;
}

function buildParticle(group, kind, color, index) {
	const material = sharedMaterial(kind, color, 'fragment');
	const mesh = creaturePart(
		`${kind}_light_fragment_${index}`,
		creatureSphereGeometry(6, 4),
		material,
		[0, 0, 0],
		[0.05, 0.05, 0.05]
	);
	group.add(mesh);
	return {
		baseScale: kind === 'trail' ? 0.042 : 0.068,
		mesh,
		spin: 0,
		velocity: { x: 0, y: 0, z: 0 }
	};
}

function buildCores(group, color) {
	const inner = buildCore('impact_inner_flash', color, 'inner', 8, 6);
	const outer = buildCore('impact_outer_wave', color, 'outer', 8, 4);
	group.add(inner);
	group.add(outer);
	return { inner, outer };
}

function buildCore(name, color, role, width, height) {
	return creaturePart(
		name,
		creatureSphereGeometry(width, height),
		sharedMaterial('impact', color, role),
		[0, 0, 0],
		[0.01, 0.01, 0.01]
	);
}

function sharedMaterial(kind, color, role) {
	const key = `${kind}:${role}:${colorKey(color)}`;
	if (!materialCache.has(key)) {
		const material = creatureMaterial(`Awtsmoos_${kind}_${role}_light`, color, null, true);
		Object.assign(material, {
			alphaMode: 'BLEND',
			opacity: role === 'outer' ? 0.28 : kind === 'trail' ? 0.5 : 0.74,
			transparent: true
		});
		materialCache.set(key, material);
	}
	return materialCache.get(key);
}

function colorKey(color) {
	return color.slice(0, 4).map(value => {
		return Math.round(Math.max(0, Math.min(1, value)) * 255);
	}).join('-');
}

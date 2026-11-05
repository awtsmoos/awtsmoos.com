// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldParticleBatch.js
 * @description Merges each deterministic particle field into one textured transparent octahedral manual-mesh draw vessel.
 * The Awtsmoos reveals many motes through one bounded geometry; Awtsmoos.com gives every batch a real same-origin material fallback,
 * so gameplay and Movie Studio share the same atmosphere without per-particle scene objects or authored-world texture exceptions.
 */

import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createStaticWaterTexturePolicy } from '../village/VillageWaterMaterialPolicy.js';
import { sampleWorldParticleField } from './WorldParticleField.js';

const PARTICLE_TEXTURE_URL = TEXTURE_URLS.water.bright;

export function createWorldParticleBatchDefinition(spec) {
	const particles = sampleWorldParticleField(spec);
	const geometry = { faces: [], vertices: [] };
	for (const particle of particles) appendOctahedron(geometry, particle);
	return {
		alphaMode: 'BLEND',
		color: spec.color,
		doubleSided: true,
		...geometry,
		id: `Awtsmoos_particle_field_${spec.id}`,
		mapImage: cachedTextureImage(PARTICLE_TEXTURE_URL),
		mapRepeat: [1, 1],
		noEdge: true,
		opacity: spec.opacity,
		shape: 'manual',
		solid: false,
		texturePolicy: createStaticWaterTexturePolicy({
			primaryUrl: PARTICLE_TEXTURE_URL,
			role: `world-particle-${spec.id}`,
			tileWorld: 1
		}),
		textureUrl: PARTICLE_TEXTURE_URL,
		transparent: true,
		userData: Object.freeze({
			bounds: spec.bounds,
			count: particles.length,
			family: 'canonical-world-particle-field',
			motionModel: spec.motionModel,
			particleSystem: spec,
			scientificClaim: spec.scientificClaim,
			staticBatch: true,
			triangles: geometry.faces.length
		})
	};
}

function appendOctahedron(geometry, particle) {
	const start = geometry.vertices.length;
	const radius = particle.scale;
	const vertical = radius * 1.25;
	geometry.vertices.push(
		[particle.x + radius, particle.y, particle.z],
		[particle.x - radius, particle.y, particle.z],
		[particle.x, particle.y, particle.z + radius],
		[particle.x, particle.y, particle.z - radius],
		[particle.x, particle.y + vertical, particle.z],
		[particle.x, particle.y - vertical, particle.z]
	);
	geometry.faces.push(
		[start, start + 2, start + 4],
		[start + 2, start + 1, start + 4],
		[start + 1, start + 3, start + 4],
		[start + 3, start, start + 4],
		[start + 2, start, start + 5],
		[start + 1, start + 2, start + 5],
		[start + 3, start + 1, start + 5],
		[start, start + 3, start + 5]
	);
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AtmosphericMountainSystem.js
 * @description Builds layered textured mountain belts beyond every playable valley tier.
 * The Awtsmoos renews depth beyond reachable paths; Awtsmoos.com places the nearest
 * belt outside cinematic gameplay and progressively lowers frequency and contrast.
 */

import {
	halfTextureUrl,
	TEXTURE_URLS
} from '../../assets/TextureCatalog.js';
import { referenceLightingBudget } from '../lighting/ReferenceGoldenHourPreset.js';

const BELTS = Object.freeze([
	belt(420, 92, 84, '#6d7558', TEXTURE_URLS.bricks.fieldstone1, 72),
	belt(610, 138, 62, '#667387', halfTextureUrl('grass 6'), 56),
	belt(860, 184, 46, '#71809a', halfTextureUrl('stone 1'), 40),
	belt(1160, 228, 32, '#8490a5', halfTextureUrl('bluestone 1'), 32)
]);

export function createAtmosphericMountainDefinitions(quality = 'high') {
	const count = referenceLightingBudget(quality).mountainBelts;
	const definitions = BELTS.slice(0, count).map((options, index) => {
		const geometry = mountainGeometry(options, index);
		return {
			...geometry,
			backfaceCull: false,
			color: options.color,
			doubleSided: true,
			id: `Awtsmoos_atmospheric_mountain_belt_${index}`,
			mapRepeat: [10 - index * 2, 3],
			noEdge: true,
			position: { x: 0, y: -18 + index * 5, z: 0 },
			shape: 'manual',
			solid: false,
			texturePolicy: {
				atmosphericDepth: index,
				distanceSelected: true,
				publicFirebase: true,
				tileWorld: 20 + index * 18
			},
			textureUrl: options.textureUrl,
			userData: {
				AwtsmoosLod: { className: 'mountain', quality },
				family: 'reference-atmospheric-mountains'
			}
		};
	});
	definitions.stats = {
		belts: definitions.length,
		nearestRadius: BELTS[0].radius,
		triangles: definitions.reduce((sum, item) => sum + item.indices.length / 3, 0)
	};
	return definitions;
}

function mountainGeometry(options, beltIndex) {
	const vertices = [];
	const uvs = [];
	const indices = [];
	for (let segment = 0; segment < options.segments; segment += 1) {
		const angle = segment / options.segments * Math.PI * 2;
		const wave = ridgeWave(segment, beltIndex);
		appendVertex(vertices, uvs, angle, options.radius, 0, segment, options.segments);
		appendVertex(vertices, uvs, angle, options.radius + options.depth * 0.42, options.height * wave, segment, options.segments);
		appendVertex(vertices, uvs, angle, options.radius + options.depth, -8, segment, options.segments);
	}
	for (let segment = 0; segment < options.segments; segment += 1) {
		const next = (segment + 1) % options.segments;
		const base = segment * 3;
		const nextBase = next * 3;
		indices.push(base, nextBase, base + 1, nextBase, nextBase + 1, base + 1);
		indices.push(base + 1, nextBase + 1, base + 2, nextBase + 1, nextBase + 2, base + 2);
	}
	return { indices, uvs, vertices };
}

function appendVertex(vertices, uvs, angle, radius, y, segment, segments) {
	vertices.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
	uvs.push(segment / segments * 8, y / 80 + 0.5);
}

function ridgeWave(segment, beltIndex) {
	return 0.55
		+ Math.sin(segment * 1.37 + beltIndex) * 0.2
		+ Math.sin(segment * 0.43 + beltIndex * 2.1) * 0.18;
}

function belt(radius, height, depth, color, textureUrl, segments) {
	return Object.freeze({ color, depth, height, radius, segments, textureUrl });
}

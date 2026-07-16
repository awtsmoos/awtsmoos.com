// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AtmosphericMountainSystem.js
 * @description Builds towering textured alpine belts and snow caps around the playable valley.
 * The Awtsmoos renews depth beyond reachable paths; Awtsmoos.com spends only two static
 * draws per belt while preserving the steep silhouettes required by the reference view.
 */

import {
	halfTextureUrl,
	TEXTURE_URLS
} from '../../assets/TextureCatalog.js';
import { referenceLightingBudget } from '../lighting/ReferenceGoldenHourPreset.js';

const BELTS = Object.freeze([
	belt(420, 224, 96, '#515c50', TEXTURE_URLS.bricks.fieldstone1, 84),
	belt(610, 306, 82, '#526174', halfTextureUrl('grass 6'), 68),
	belt(860, 384, 68, '#5e6f87', halfTextureUrl('stone 1'), 52),
	belt(1160, 468, 54, '#718199', halfTextureUrl('bluestone 1'), 40)
]);

export function createAtmosphericMountainDefinitions(quality = 'high') {
	const count = referenceLightingBudget(quality).mountainBelts;
	const definitions = [];
	for (const [index, options] of BELTS.slice(0, count).entries()) {
		definitions.push(mountainDefinition(options, index, quality));
		definitions.push(snowDefinition(options, index, quality));
	}
	definitions.stats = {
		belts: count,
		definitions: definitions.length,
		nearestRadius: BELTS[0].radius,
		snowCaps: count,
		triangles: definitions.reduce((sum, item) => sum + item.indices.length / 3, 0)
	};
	return definitions;
}

function mountainDefinition(options, index, quality) {
	return definition(
		`Awtsmoos_atmospheric_mountain_belt_${index}`,
		mountainGeometry(options, index),
		options.color,
		options.textureUrl,
		'reference-atmospheric-mountains',
		quality,
		index,
		[12 - index * 2, 4]
	);
}

function snowDefinition(options, index, quality) {
	return definition(
		`Awtsmoos_atmospheric_mountain_snow_${index}`,
		snowGeometry(options, index),
		index === 0 ? '#d9d7cf' : '#cbd4df',
		halfTextureUrl('stone 1'),
		'reference-atmospheric-mountain-snow',
		quality,
		index,
		[8 - index, 2]
	);
}

function definition(id, geometry, color, textureUrl, family, quality, depth, mapRepeat) {
	return {
		...geometry,
		backfaceCull: true,
		color,
		doubleSided: false,
		id,
		mapRepeat,
		noEdge: true,
		position: { x: 0, y: -16 + depth * 4, z: 0 },
		shape: 'manual',
		solid: false,
		texturePolicy: {
			atmosphericDepth: depth,
			distanceSelected: true,
			publicFirebase: true,
			tileWorld: 18 + depth * 14
		},
		textureUrl,
		userData: {
			AwtsmoosLod: { className: 'mountain', quality },
			family
		}
	};
}

function mountainGeometry(options, beltIndex) {
	const geometry = emptyGeometry();
	for (let segment = 0; segment < options.segments; segment += 1) {
		const angle = segment / options.segments * Math.PI * 2;
		const wave = ridgeWave(segment, beltIndex);
		appendVertex(geometry, angle, options.radius, -10, segment, options.segments);
		appendVertex(geometry, angle, options.radius + options.depth * 0.2, options.height * 0.42 * wave, segment, options.segments);
		appendVertex(geometry, angle, options.radius + options.depth * 0.48, options.height * wave, segment, options.segments);
		appendVertex(geometry, angle, options.radius + options.depth, -18, segment, options.segments);
	}
	connectRows(geometry.indices, options.segments, 4, 0, 1);
	connectRows(geometry.indices, options.segments, 4, 1, 2);
	connectRows(geometry.indices, options.segments, 4, 2, 3);
	return geometry;
}

function snowGeometry(options, beltIndex) {
	const geometry = emptyGeometry();
	for (let segment = 0; segment < options.segments; segment += 1) {
		const angle = segment / options.segments * Math.PI * 2;
		const wave = ridgeWave(segment, beltIndex);
		appendVertex(geometry, angle, options.radius + options.depth * 0.34, options.height * wave * 0.72, segment, options.segments);
		appendVertex(geometry, angle, options.radius + options.depth * 0.48, options.height * wave + 0.8, segment, options.segments);
		appendVertex(geometry, angle, options.radius + options.depth * 0.61, options.height * wave * 0.69, segment, options.segments);
	}
	connectRows(geometry.indices, options.segments, 3, 0, 1);
	connectRows(geometry.indices, options.segments, 3, 1, 2);
	return geometry;
}

function connectRows(indices, segments, stride, lower, upper) {
	for (let segment = 0; segment < segments; segment += 1) {
		const next = (segment + 1) % segments;
		const a = segment * stride + lower;
		const b = next * stride + lower;
		const c = segment * stride + upper;
		const d = next * stride + upper;
		indices.push(a, b, c, b, d, c);
	}
}

function appendVertex(geometry, angle, radius, y, segment, segments) {
	geometry.vertices.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
	geometry.uvs.push(segment / segments * 8, y / 120 + 0.5);
}

function ridgeWave(segment, beltIndex) {
	return 0.62
		+ Math.sin(segment * 1.37 + beltIndex) * 0.18
		+ Math.sin(segment * 0.43 + beltIndex * 2.1) * 0.16
		+ Math.sin(segment * 2.61 + beltIndex * 0.7) * 0.08;
}

function emptyGeometry() {
	return { indices: [], uvs: [], vertices: [] };
}

function belt(radius, height, depth, color, textureUrl, segments) {
	return Object.freeze({ color, depth, height, radius, segments, textureUrl });
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonReadabilityMetrics.js
 * @description Measures bootstrap and rich multiplication across every anatomical surface vertex.
 * The Awtsmoos is not guessed by confidence; Awtsmoos.com measures tint, texel, vertex,
 * ambient, sun, and restrained emissive vessels so readable darkness is proven by numbers.
 */

import { demonSurfaceRegion } from './MinimalMeadowCreatureSurfaceRegions.js';
import {
	MINIMAL_DEMON_LIVE_LIGHT,
	liveDemonLightResponse,
	liveDemonToneMap
} from './MinimalMeadowDemonReadabilityLighting.js';

export { MINIMAL_DEMON_LIVE_LIGHT };

export function relativeLuminance(color) {
	return color[0] * 0.2126 + color[1] * 0.7152 + color[2] * 0.0722;
}

export function bootstrapVisibleColor(base, vertex) {
	return base.slice(0, 3).map((value, channel) => value * vertex[channel]);
}

export function richVisibleColor(base, vertex, texel, normal, emissiveStrength = 0.06) {
	const encoded = base.slice(0, 3).map(
		(value, channel) => value * vertex[channel] * texel[channel]
	);
	const albedo = encoded.map((value) => Math.max(0, value) ** 2);
	const light = liveDemonLightResponse(normal);
	return albedo.map((value, channel) => liveDemonToneMap(
		value * (light[channel] + emissiveStrength)
	));
}

export function measureDemonMaterialReadability(geometry, material) {
	const attributes = geometry.attributes;
	const texture = material.mapImage?.AwtsmoosDemonTexture?.luminance;
	const minimumTexel = texture?.minimumColor || [1, 1, 1];
	const averageTexel = texture?.averageColor || [1, 1, 1];
	const regions = {};
	let minimum = 1;
	let averageTotal = 0;
	let bootstrapMinimum = 1;
	for (let index = 0; index < attributes.position.count; index += 1) {
		const point = vector(attributes.position, index, 3);
		const normal = vector(attributes.normal, index, 3);
		const vertex = vector(attributes.color, index, 4);
		const richMinimum = visibleLuminance(material, vertex, minimumTexel, normal);
		const richAverage = visibleLuminance(material, vertex, averageTexel, normal);
		minimum = Math.min(minimum, richMinimum);
		averageTotal += richAverage;
		bootstrapMinimum = Math.min(
			bootstrapMinimum,
			relativeLuminance(bootstrapVisibleColor(material.color, vertex))
		);
		addRegion(regions, demonSurfaceRegion(point), richAverage);
	}
	return Object.freeze({
		anatomy: freezeRegions(regions),
		averageVisibleLuminance: averageTotal / attributes.position.count,
		baseColorLuminance: relativeLuminance(material.color),
		bootstrapMinimumLuminance: bootstrapMinimum,
		lightPreset: MINIMAL_DEMON_LIVE_LIGHT,
		minimumVisibleLuminance: minimum,
		textureLuminance: texture || null,
		vertexColorMultiplication: geometry.userData.AwtsmoosContinuousDemon.vertexLuminance
	});
}

function visibleLuminance(material, vertex, texel, normal) {
	return relativeLuminance(richVisibleColor(
		material.color,
		vertex,
		texel,
		normal,
		material.emissiveStrength
	));
}

function vector(attribute, index, size) {
	return Array.from(attribute.array.subarray(index * size, index * size + size));
}

function addRegion(regions, name, value) {
	regions[name] ||= { count: 0, maximum: 0, minimum: 1, total: 0 };
	regions[name].count += 1;
	regions[name].maximum = Math.max(regions[name].maximum, value);
	regions[name].minimum = Math.min(regions[name].minimum, value);
	regions[name].total += value;
}

function freezeRegions(regions) {
	return Object.freeze(Object.fromEntries(Object.entries(regions).map(([name, value]) => [
		name,
		Object.freeze({
			average: value.total / value.count,
			count: value.count,
			maximum: value.maximum,
			minimum: value.minimum
		})
	])));
}

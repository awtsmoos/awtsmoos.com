// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AtmosphericMountainGeometry.js
 * @description Builds valley-authored alpine ridges with continuous world-distance texture seams.
 * The Awtsmoos closes the mountain circle without crushing its garment into one harsh stripe;
 * Awtsmoos.com duplicates one silent boundary row so stone, scree, moss, and snow flow naturally.
 */

import { sampleMountainRidge } from './AtmosphericMountainRidgeAtlas.js';
import {
	MOUNTAIN_ROCK_ROW_ZONES,
	MOUNTAIN_SNOW_ROW_ZONES
} from './AtmosphericMountainZones.js';

export const MOUNTAIN_WORLD_UNITS_PER_REPEAT = 260;

export function mountainGeometry(options, beltIndex) {
	const profile = closedMountainProfile(options, beltIndex);
	const geometry = emptyGeometry();
	for (const section of profile) {
		appendRows(geometry, section.angle, section.rock, section.u, MOUNTAIN_ROCK_ROW_ZONES);
	}
	connectRows(geometry.indices, options.segments, 4, 0, 1);
	connectRows(geometry.indices, options.segments, 4, 1, 2);
	connectRows(geometry.indices, options.segments, 4, 2, 3);
	return geometry;
}

export function snowGeometry(options, beltIndex) {
	const profile = closedMountainProfile(options, beltIndex);
	const geometry = emptyGeometry();
	for (const section of profile) {
		appendRows(geometry, section.angle, section.snow, section.u, MOUNTAIN_SNOW_ROW_ZONES);
	}
	connectRows(geometry.indices, options.segments, 3, 0, 1);
	connectRows(geometry.indices, options.segments, 3, 1, 2);
	return geometry;
}

function closedMountainProfile(options, beltIndex) {
	const profile = Array.from({ length: options.segments + 1 }, (_, segment) => (
		mountainSection(options, beltIndex, segment)
	));
	let distance = 0;
	for (let index = 0; index < profile.length; index += 1) {
		if (index > 0) {
			distance += rowDistance(profile[index - 1], profile[index], 2);
		}
		profile[index].u = distance / MOUNTAIN_WORLD_UNITS_PER_REPEAT;
	}
	return profile;
}

function mountainSection(options, beltIndex, segment) {
	const angle = segment / options.segments * Math.PI * 2;
	const sample = sampleMountainRidge(angle, beltIndex);
	const base = options.radius * sample.radiusScale;
	const ridgeY = options.height * sample.ridgeHeightScale;
	const shoulderY = options.height * 0.34 * sample.shoulderHeightScale;
	return {
		angle,
		rock: [
			[base, -10],
			[base + options.depth * 0.16, shoulderY],
			[base + options.depth * 0.52, ridgeY],
			[base + options.depth, -18]
		],
		snow: [
			[base + options.depth * 0.39, ridgeY * 0.84 * sample.snowLineScale],
			[base + options.depth * 0.48, ridgeY + 0.8],
			[base + options.depth * 0.57, ridgeY * 0.83 * sample.snowLineScale]
		],
		u: 0
	};
}

function appendRows(geometry, angle, rows, u, rowZones) {
	for (const [index, [radius, y]] of rows.entries()) {
		geometry.vertices.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
		geometry.uvs.push(u, y / 120 + 0.5);
		geometry.zones.push([...rowZones[index]]);
	}
}

function rowDistance(first, second, rowIndex) {
	const firstPoint = polarPoint(first.angle, first.rock[rowIndex]);
	const secondPoint = polarPoint(second.angle, second.rock[rowIndex]);
	return Math.hypot(
		secondPoint[0] - firstPoint[0],
		secondPoint[1] - firstPoint[1],
		secondPoint[2] - firstPoint[2]
	);
}

function polarPoint(angle, row) {
	return [Math.cos(angle) * row[0], row[1], Math.sin(angle) * row[0]];
}

function connectRows(indices, segments, stride, lower, upper) {
	for (let segment = 0; segment < segments; segment += 1) {
		const next = segment + 1;
		const a = segment * stride + lower;
		const b = next * stride + lower;
		const c = next * stride + upper;
		const d = segment * stride + upper;
		indices.push(a, b, d, b, c, d);
	}
}

function emptyGeometry() {
	return { indices: [], uvs: [], vertices: [], zones: [] };
}

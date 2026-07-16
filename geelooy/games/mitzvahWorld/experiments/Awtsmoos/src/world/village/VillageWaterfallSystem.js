// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterfallSystem.js
 * @description Derives sheets, rapids, mist veils, and ledges from exact river drops.
 * The Awtsmoos pours one current through many descents; Awtsmoos.com forbids floating
 * waterfall cards by binding every top and bottom edge to the shared hydrology profile.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import {
	RIVER_CASCADES,
	createRiverHydrology,
	sampleHydrologyAt
} from './VillageRiverHydrology.js';

export function createWaterfallDefinitions(groundSampler, hydrology = null) {
	const profile = hydrology || createRiverHydrology(groundSampler);
	const sheets = geometry();
	const rapidsAndMist = geometry();
	const ledges = [];
	for (const [index, cascade] of RIVER_CASCADES.entries()) {
		appendCascade(profile, cascade.t, index, sheets, rapidsAndMist, ledges);
	}
	return [
		waterDefinition('stream-waterfall-sheets', sheets, [4, 2], '#d7f6ff', 0.86),
		waterDefinition('stream-whitewater-and-mist', rapidsAndMist, [6, 1], '#effcff', 0.72),
		createVillageBoxBatch('stream-cascade-fieldstone-ledges', ledges, {
			color: '#6f6a61',
			family: 'connected-stream-cascade',
			part: 'fieldstone-ledge',
			textureUrl: TEXTURE_URLS.bricks.fieldstone1
		})
	];
}

function appendCascade(profile, t, index, sheets, rapids, ledges) {
	const top = sampleHydrologyAt(profile, Math.max(0, t - 0.012));
	const bottom = sampleHydrologyAt(profile, Math.min(1, t + 0.012));
	const halfWidth = Math.min(top.width, bottom.width) * 0.9;
	const topLeft = bankPoint(top, -halfWidth, top.y);
	const topRight = bankPoint(top, halfWidth, top.y);
	const bottomLeft = bankPoint(bottom, -halfWidth, bottom.y);
	const bottomRight = bankPoint(bottom, halfWidth, bottom.y);
	appendQuad(sheets, [topLeft, topRight, bottomRight, bottomLeft]);
	appendRapid(rapids, bottom, halfWidth);
	appendMist(rapids, top, bottom, halfWidth, index);
	ledges.push({
		position: { x: top.x, y: bottom.y - 0.16, z: top.z },
		size: { x: halfWidth * 2.5, y: 0.55, z: 1.05 },
		yaw: Math.atan2(-top.normal.z, top.normal.x)
	});
}

function appendRapid(output, point, width) {
	const direction = { x: point.normal.z, z: -point.normal.x };
	appendQuad(output, [
		bankPoint(point, -width, point.y + 0.035),
		bankPoint(point, width, point.y + 0.035),
		[point.x + direction.x * 4 + point.normal.x * width, point.y + 0.02, point.z + direction.z * 4 + point.normal.z * width],
		[point.x + direction.x * 4 - point.normal.x * width, point.y + 0.02, point.z + direction.z * 4 - point.normal.z * width]
	]);
}

function appendMist(output, top, bottom, width, index) {
	const centerY = (top.y + bottom.y) / 2;
	const spread = width * (0.45 + index * 0.06);
	appendQuad(output, [
		[top.x - spread, centerY - 0.8, top.z],
		[top.x + spread, centerY - 0.8, top.z],
		[top.x + spread * 1.25, centerY + 0.9, top.z],
		[top.x - spread * 1.25, centerY + 0.9, top.z]
	]);
}

function bankPoint(point, offset, y) {
	return [point.x + point.normal.x * offset, y, point.z + point.normal.z * offset];
}

function geometry() {
	return { faces: [], uvs: [], vertices: [] };
}

function appendQuad(output, points) {
	const start = output.vertices.length;
	output.vertices.push(...points);
	output.faces.push([start, start + 1, start + 2, start + 3]);
	output.uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
}

function waterDefinition(id, geometryData, mapRepeat, color, opacity) {
	return {
		alphaMode: 'BLEND', color, doubleSided: true, ...geometryData,
		id: `Awtsmoos_${id}`, mapRepeat, noEdge: true, opacity, shape: 'manual',
		solid: false, textureUrl: TEXTURE_URLS.water.bright, transparent: true,
		texturePolicy: { animated: true, publicFirebase: true, shader: 'layered-flow-refraction-fresnel-foam' },
		userData: { family: 'connected-stream-cascade', instances: RIVER_CASCADES.length }
	};
}

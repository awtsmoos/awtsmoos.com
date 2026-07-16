// B"H
/** Adds batched timber framing, shutters, flower boxes, blossoms, and entry steps to cottages. */
import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';

export function createCottageOrnamentCollector() {
	return { beams: [], blossoms: [], flowerBoxes: [], shutters: [], steps: [] };
}

export function appendCottageOrnaments(collector, cottage) {
	appendRoofAndFacadeBeams(collector.beams, cottage);
	if (cottage.detail === 'far') return;
	appendShutters(collector.shutters, cottage);
	appendFlowerBoxes(collector, cottage);
	collector.steps.push(localBox(cottage, 0, 0.22, cottage.depth * 0.61, 1.8, 0.42, 0.82));
}

export function createCottageOrnamentBatches(collector) {
	return [
		batch('cottage-timber-frame-batch', collector.beams, '#4a2e1d', TEXTURE_URLS.wood.oak3, 'timber-frame'),
		batch('cottage-shutter-batch', collector.shutters, '#385b52', TEXTURE_URLS.wood.oak2, 'shutters'),
		batch('cottage-flower-box-batch', collector.flowerBoxes, '#5a3620', TEXTURE_URLS.wood.planks1, 'flower-box'),
		blossomBatch(collector.blossoms),
		batch('cottage-entry-step-batch', collector.steps, '#8c8274', TEXTURE_URLS.bricks.fieldstone1, 'entry-step')
	].filter(Boolean);
}

function blossomBatch(blossoms) {
	if (!blossoms.length) return null;
	const vertices = [];
	const faces = [];
	for (const blossom of blossoms) appendBlossom(vertices, faces, blossom);
	return {
		id: 'Awtsmoos_cottage-blossom-batch',
		shape: 'manual',
		vertices,
		faces,
		color: '#e16c96',
		alphaMode: 'OPAQUE',
		doubleSided: true,
		noEdge: true,
		solid: false,
		userData: {
			family: 'reference-cottage-ornament-batch',
			part: 'blossoms',
			AwtsmoosLod: { className: 'vegetation' }
		},
		texturePolicy: { role: 'flower-box-petal-geometry', shader: 'petal-geometry-wind' }
	};
}

function appendBlossom(vertices, faces, blossom) {
	const start = vertices.length;
	const { x, y, z } = blossom.position;
	const radius = blossom.size.x * 0.55;
	vertices.push(
		[x, y + blossom.size.y * 0.65, z],
		[x, y - blossom.size.y * 0.35, z],
		[x + radius, y, z],
		[x, y, z + radius],
		[x - radius, y, z],
		[x, y, z - radius]
	);
	for (const [a, b] of [[2, 3], [3, 4], [4, 5], [5, 2]]) {
		faces.push([start, start + a, start + b], [start + 1, start + b, start + a]);
	}
}

function appendRoofAndFacadeBeams(output, cottage) {
	output.push(localBox(cottage, 0, 3.18, cottage.depth * 0.525, cottage.width * 0.94, 0.16, 0.18));
	output.push(localBox(cottage, 0, 1.72, cottage.depth * 0.53, 0.17, 3.05, 0.19));
	output.push(localBox(cottage, 0, 4.95, 0, cottage.width + 0.82, 0.15, 0.18));
}

function appendShutters(output, cottage) {
	for (const windowSide of [-1, 1]) {
		const windowX = windowSide * cottage.width * 0.23;
		for (const shutterSide of [-1, 1]) {
			output.push(localBox(
				cottage,
				windowX + shutterSide * 0.53,
				2,
				cottage.depth * 0.535,
				0.22,
				1.05,
				0.10
			));
		}
	}
}

function appendFlowerBoxes(collector, cottage) {
	for (const side of [-1, 1]) {
		const x = side * cottage.width * 0.23;
		collector.flowerBoxes.push(localBox(cottage, x, 1.43, cottage.depth * 0.565, 1.15, 0.25, 0.34));
		for (const offset of [-0.34, 0, 0.34]) {
			collector.blossoms.push(localBox(cottage, x + offset, 1.70, cottage.depth * 0.59, 0.30, 0.34, 0.30));
		}
	}
}

function localBox(cottage, localX, localY, localZ, x, y, z) {
	const cosine = Math.cos(cottage.yaw);
	const sine = Math.sin(cottage.yaw);
	return {
		position: {
			x: cottage.x + localX * cosine + localZ * sine,
			y: cottage.base + localY,
			z: cottage.z - localX * sine + localZ * cosine
		},
		size: { x, y, z },
		yaw: cottage.yaw
	};
}

function batch(id, boxes, color, textureUrl, part, texturePolicy = {}) {
	if (!boxes.length) return null;
	return createVillageBoxBatch(id, boxes, {
		color,
		family: 'reference-cottage-ornament-batch',
		part,
		texturePolicy,
		textureUrl
	});
}

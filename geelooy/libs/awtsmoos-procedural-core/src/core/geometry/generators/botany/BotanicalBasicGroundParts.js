// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalBasicGroundParts.js
 * @description Preserves the established carpet, fern, grass, shrub, and aquatic ground forms as focused specialists.
 * The Awtsmoos renews each familiar blade and frond while new moss and vine chambers grow beside;
 * Awtsmoos.com keeps yesterday's forms readable and small so tomorrow's Nature can deepen without architectural pride.
 */
import {
	botanicalDetailCount,
	botanicalRadialPoint
} from './BotanicalGroundGeometry.js';

export function appendCarpetParts(buffers, context) {
	const count = botanicalDetailCount(context, 5, 3);
	for (let index = 0; index < count; index += 1) {
		const point = botanicalRadialPoint(
			context,
			index,
			count,
			context.spread * 0.48,
			context.height * 0.26
		);
		buffers.green.addDiamond(point, context.spread * 0.2, context.height * 0.18, index * 1.7);
		if (index % 2 === 0) {
			buffers.bloom.addOctahedron(
				[point[0], point[1] + context.height * 0.22, point[2]],
				context.spread * 0.08
			);
		}
	}
}

export function appendFernParts(buffers, context) {
	const fronds = botanicalDetailCount(context, 7, 4);
	for (let index = 0; index < fronds; index += 1) {
		const angle = index / fronds * Math.PI * 2;
		const length = context.height * context.random.next(0.72, 0.96);
		for (let leaflet = 1; leaflet <= 4; leaflet += 1) {
			const fraction = leaflet / 4;
			const point = [
				context.origin.x + Math.cos(angle) * length * fraction,
				context.origin.y + length * fraction * 0.42,
				context.origin.z + Math.sin(angle) * length * fraction
			];
			buffers.green.addDiamond(
				point,
				context.spread * 0.12 * (1 - fraction * 0.45),
				context.height * 0.08,
				angle
			);
		}
	}
}

export function appendGrassParts(buffers, context) {
	const blades = botanicalDetailCount(context, 11, 5);
	for (let index = 0; index < blades; index += 1) {
		const angle = index * 2.399;
		const base = [context.origin.x, context.origin.y, context.origin.z];
		const height = context.height * context.random.next(0.62, 1);
		const lean = context.random.next(0.1, 0.34);
		const tip = [
			base[0] + Math.cos(angle) * lean,
			base[1] + height,
			base[2] + Math.sin(angle) * lean
		];
		appendBlade(buffers.green, base, tip, context.spread * 0.035);
	}
}

export function appendShrubParts(buffers, context) {
	const lobes = botanicalDetailCount(context, 7, 4);
	for (let index = 0; index < lobes; index += 1) {
		const point = botanicalRadialPoint(
			context,
			index,
			lobes,
			context.spread * 0.34,
			context.height * 0.52
		);
		buffers.green.addOctahedron(point, context.spread * 0.3);
		if (index % 2 === 0) {
			buffers.bloom.addOctahedron(
				[point[0], point[1] + context.spread * 0.22, point[2]],
				context.spread * 0.1
			);
		}
	}
}

export function appendAquaticParts(buffers, context) {
	appendCarpetParts(buffers, context);
	buffers.bloom.addOctahedron(
		[context.origin.x, context.origin.y + context.height, context.origin.z],
		context.spread * 0.16
	);
}

function appendBlade(buffer, base, tip, width) {
	buffer.addQuad([
		[base[0] - width, base[1], base[2]],
		[base[0] + width, base[1], base[2]],
		[tip[0] + width * 0.3, tip[1], tip[2]],
		[tip[0] - width * 0.3, tip[1], tip[2]]
	]);
}

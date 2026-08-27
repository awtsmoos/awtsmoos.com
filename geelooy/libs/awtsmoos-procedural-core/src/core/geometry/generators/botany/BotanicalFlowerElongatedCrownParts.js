// B"H
// Boruch Hashem
// Blessed is He
/** Elongated, bell, plume, and heart crowns remain focused visual recipes. */

import {
	botanicalDetailCount,
	botanicalOffset
} from "./BotanicalFlowerGeometry.js";

export function appendSpikeCrown(buffers, context) {
	const count = botanicalDetailCount(context, context.species.petals, 4);
	for (let index = 0; index < count; index += 1) {
		const fraction = 0.56 + index / Math.max(1, count - 1) * 0.42;
		const radius = context.spread * (0.22 - index / count * 0.1);
		buffers.bloom.addOctahedron(
			botanicalOffset(context, index * 2.399, radius, fraction),
			context.spread * 0.12
		);
	}
}

export function appendBellCrown(buffers, context) {
	const count = botanicalDetailCount(context, context.species.petals, 3);
	for (let index = 0; index < count; index += 1) {
		const angle = index / count * Math.PI * 2;
		buffers.bloom.addDiamond(
			botanicalOffset(
				context,
				angle,
				context.spread * 0.24,
				0.72 + index / count * 0.22
			),
			context.spread * 0.14,
			context.spread * 0.18,
			angle
		);
	}
}

export function appendPlumeCrown(buffers, context) {
	const count = botanicalDetailCount(context, context.species.petals * 2, 6);
	for (let index = 0; index < count; index += 1) {
		const fraction = 0.48 + index / count * 0.5;
		const radius = context.spread * (1 - fraction) * 0.72;
		buffers.bloom.addOctahedron(
			botanicalOffset(context, index * 2.399, radius, fraction),
			context.spread * 0.08
		);
	}
}

export function appendHeartCrown(buffers, context) {
	const count = botanicalDetailCount(context, context.species.petals, 3);
	for (let index = 0; index < count; index += 1) {
		const angle = index / count * Math.PI * 2;
		buffers.bloom.addDiamond(
			botanicalOffset(context, angle, context.spread * 0.28, 0.72),
			context.spread * 0.12,
			context.spread * 0.16,
			angle
		);
	}
}

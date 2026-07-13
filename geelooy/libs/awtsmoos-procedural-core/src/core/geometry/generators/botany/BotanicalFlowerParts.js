// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalFlowerParts.js
 * @description Builds petals, bells, globes, and spikes as recognizable low-poly
 * flowers. Each finite bloom turns toward the one renewing Awtsmoos.
 */
import {
	appendPetalRing,
	botanicalDetailCount,
	botanicalOffset,
	botanicalTop
} from './BotanicalFlowerGeometry.js';

export function appendFlowerForm(buffers, context) {
	appendStem(buffers.green, context);
	const handlers = {
		ray: appendRay,
		rosette: appendRosette,
		cup: appendCup,
		spike: appendSpike,
		globe: appendGlobe,
		bell: appendBell,
		plume: appendPlume,
		heart: appendHeart
	};
	(handlers[context.species.archetype] || appendRay)(buffers, context);
}

function appendStem(buffer, context) {
	const { x, y, z } = context.origin;
	const width = Math.max(0.012, context.spread * 0.055);
	const top = y + context.height;
	buffer.addQuad([[x - width, y, z], [x + width, y, z], [x + width, top, z], [x - width, top, z]]);
	buffer.addQuad([[x, y, z - width], [x, y, z + width], [x, top, z + width], [x, top, z - width]]);
	for (const fraction of [0.34, 0.58]) {
		buffer.addDiamond([x, y + context.height * fraction, z], context.spread * 0.24, context.spread * 0.12, fraction * 7);
	}
}

function appendRay(buffers, context) {
	const count = botanicalDetailCount(context, context.species.petals, 5);
	appendPetalRing(buffers.bloom, context, count, context.spread * 0.55, 0);
	buffers.accent.addOctahedron(botanicalTop(context), context.spread * 0.16);
}

function appendRosette(buffers, context) {
	const count = botanicalDetailCount(context, context.species.petals, 6);
	appendPetalRing(buffers.bloom, context, count, context.spread * 0.48, 0);
	appendPetalRing(buffers.bloom, context, Math.max(5, Math.floor(count * 0.68)), context.spread * 0.32, Math.PI / count);
	buffers.accent.addOctahedron(botanicalTop(context), context.spread * 0.11);
}

function appendCup(buffers, context) {
	const count = botanicalDetailCount(context, context.species.petals, 4);
	appendPetalRing(buffers.bloom, context, count, context.spread * 0.46, 0, context.spread * 0.24);
	buffers.accent.addOctahedron(botanicalTop(context), context.spread * 0.1);
}

function appendSpike(buffers, context) {
	const count = botanicalDetailCount(context, context.species.petals, 4);
	for (let index = 0; index < count; index += 1) {
		const fraction = 0.56 + index / Math.max(1, count - 1) * 0.42;
		const radius = context.spread * (0.22 - index / count * 0.1);
		buffers.bloom.addOctahedron(botanicalOffset(context, index * 2.399, radius, fraction), context.spread * 0.12);
	}
}

function appendGlobe(buffers, context) {
	const count = botanicalDetailCount(context, context.species.petals, 6);
	const center = botanicalTop(context);
	for (let index = 0; index < count; index += 1) {
		const angle = index * 2.399;
		buffers.bloom.addOctahedron([
			center[0] + Math.cos(angle) * context.spread * 0.24,
			center[1] + (index % 3 - 1) * context.spread * 0.12,
			center[2] + Math.sin(angle) * context.spread * 0.24
		], context.spread * 0.11);
	}
}

function appendBell(buffers, context) {
	const count = botanicalDetailCount(context, context.species.petals, 3);
	for (let index = 0; index < count; index += 1) {
		const angle = index / count * Math.PI * 2;
		const center = botanicalOffset(context, angle, context.spread * 0.24, 0.72 + index / count * 0.22);
		buffers.bloom.addDiamond(center, context.spread * 0.14, context.spread * 0.18, angle);
	}
}

function appendPlume(buffers, context) {
	const count = botanicalDetailCount(context, context.species.petals * 2, 6);
	for (let index = 0; index < count; index += 1) {
		const fraction = 0.48 + index / count * 0.5;
		const radius = context.spread * (1 - fraction) * 0.72;
		buffers.bloom.addOctahedron(botanicalOffset(context, index * 2.399, radius, fraction), context.spread * 0.08);
	}
}

function appendHeart(buffers, context) {
	const count = botanicalDetailCount(context, context.species.petals, 3);
	for (let index = 0; index < count; index += 1) {
		const angle = index / count * Math.PI * 2;
		buffers.bloom.addDiamond(botanicalOffset(context, angle, context.spread * 0.28, 0.72), context.spread * 0.12, context.spread * 0.16, angle);
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalVineParts.js
 * @description Reveals vines as connected climbing organisms with stems, leaves, tendrils, and bloom sites.
 * The Awtsmoos renews each node before the vine remembers wall, branch, or air;
 * Awtsmoos.com lets guides shape the climb while unguided growth still rises with deterministic care.
 */
import {
	appendStemRibbon,
	botanicalDetailCount,
	normalizeBotanicalGuidePoints,
	pointAlongBotanicalGuide
} from './BotanicalGroundGeometry.js';

/** Appends one bounded guided or free-climbing vine into existing botanical material buffers. */
export function appendVineParts(buffers, context) {
	const nodes = botanicalDetailCount(context, 10, 5);
	const guide = normalizeBotanicalGuidePoints(context.guidePoints, context.origin);
	let previous = vineNode(context, guide, 0, nodes);
	for (let index = 1; index < nodes; index += 1) {
		const current = vineNode(context, guide, index, nodes);
		appendStemRibbon(buffers.accent, previous, current, context.spread * 0.012);
		appendVineLeaf(buffers, context, current, index);
		if (index % 3 === 0) {
			appendTendril(buffers, context, current, index);
		}
		if (index >= 3 && index % 4 === 0) {
			appendBloom(buffers, context, current, index);
		}
		previous = current;
	}
}

function vineNode(context, guide, index, count) {
	const fraction = count <= 1 ? 0 : index / (count - 1);
	if (guide.length >= 2) {
		return pointAlongBotanicalGuide(guide, fraction);
	}
	const angle = fraction * Math.PI * 4.2 + context.random.next(-0.08, 0.08);
	const radius = context.spread * (0.12 + fraction * 0.14);
	return [
		context.origin.x + Math.cos(angle) * radius,
		context.origin.y + fraction * context.height,
		context.origin.z + Math.sin(angle) * radius
	];
}

function appendVineLeaf(buffers, context, point, index) {
	const side = index % 2 === 0 ? 1 : -1;
	const angle = index * 2.399 + side * 0.4;
	const distance = context.spread * context.random.next(0.12, 0.22);
	const center = [
		point[0] + Math.cos(angle) * distance,
		point[1] + context.height * context.random.next(-0.015, 0.035),
		point[2] + Math.sin(angle) * distance
	];
	buffers.green.addDiamond(
		center,
		context.spread * context.random.next(0.08, 0.14),
		context.height * context.random.next(0.035, 0.07),
		angle
	);
}

function appendTendril(buffers, context, point, index) {
	const angle = index * 1.618 + context.random.next(-0.4, 0.4);
	const reach = context.spread * context.random.next(0.12, 0.24);
	const tip = [
		point[0] + Math.cos(angle) * reach,
		point[1] + context.height * context.random.next(0.01, 0.06),
		point[2] + Math.sin(angle) * reach
	];
	appendStemRibbon(buffers.accent, point, tip, context.spread * 0.005);
}

function appendBloom(buffers, context, point, index) {
	const angle = index * 1.3;
	const offset = context.spread * 0.08;
	const center = [
		point[0] + Math.cos(angle) * offset,
		point[1] + context.height * 0.035,
		point[2] + Math.sin(angle) * offset
	];
	buffers.bloom.addOctahedron(center, context.spread * context.random.next(0.025, 0.045));
}

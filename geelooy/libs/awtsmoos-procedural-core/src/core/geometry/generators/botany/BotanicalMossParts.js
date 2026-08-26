// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalMossParts.js
 * @description Reveals moss as layered living ground rather than isolated green stones.
 * The Awtsmoos renews each humble lobe where shade and moisture quietly meet;
 * Awtsmoos.com lets moss spread in soft cushions while sparse sporophytes rise like whispered wheat.
 */
import {
	appendGroundLobe,
	appendStemRibbon,
	botanicalDetailCount,
	botanicalRadialPoint
} from './BotanicalGroundGeometry.js';

/** Appends bounded moss carpets, cushions, and sparse sporophyte accents. */
export function appendMossParts(buffers, context) {
	const cushions = botanicalDetailCount(context, 9, 4);
	for (let index = 0; index < cushions; index += 1) {
		appendMossCushion(buffers, context, index, cushions);
	}
	appendSporophytes(buffers, context, cushions);
}

function appendMossCushion(buffers, context, index, count) {
	const center = botanicalRadialPoint(
		context,
		index,
		count,
		context.spread * context.random.next(0.08, 0.42),
		context.height * context.random.next(0.015, 0.05)
	);
	const radius = context.spread * context.random.next(0.11, 0.24);
	const lobeHeight = context.height * context.random.next(0.025, 0.07);
	appendGroundLobe(
		buffers.green,
		center,
		radius,
		radius * context.random.next(0.72, 1.2),
		lobeHeight
	);
	if (context.quality.detail > 0.7 && index % 2 === 0) {
		appendSatelliteLobe(buffers, context, center, radius, index);
	}
}

function appendSatelliteLobe(buffers, context, center, radius, index) {
	const angle = index * 2.399 + context.random.next(-0.3, 0.3);
	const satellite = [
		center[0] + Math.cos(angle) * radius * 0.75,
		center[1] + context.height * 0.008,
		center[2] + Math.sin(angle) * radius * 0.75
	];
	appendGroundLobe(
		buffers.green,
		satellite,
		radius * 0.62,
		radius * context.random.next(0.42, 0.68),
		context.height * context.random.next(0.015, 0.04)
	);
}

function appendSporophytes(buffers, context, cushions) {
	const stalks = botanicalDetailCount(context, 3, 1);
	for (let index = 0; index < stalks; index += 1) {
		const base = botanicalRadialPoint(
			context,
			index * 2 + 1,
			cushions + 2,
			context.spread * context.random.next(0.08, 0.3),
			context.height * 0.04
		);
		const height = context.height * context.random.next(0.16, 0.3);
		const tip = [base[0], base[1] + height, base[2]];
		appendStemRibbon(buffers.accent, base, tip, context.spread * 0.008);
		buffers.bloom.addOctahedron(tip, context.spread * 0.018);
	}
}

// B"H
// Boruch Hashem
// Blessed is He
/** Flower crown archetypes remain visual recipes around shared semantic organs. */

import {
	appendBellCrown,
	appendHeartCrown,
	appendPlumeCrown,
	appendSpikeCrown
} from "./BotanicalFlowerElongatedCrownParts.js";
import {
	appendPetalRing,
	botanicalDetailCount,
	botanicalTop
} from "./BotanicalFlowerGeometry.js";

function appendRay(buffers, context) {
	const count = botanicalDetailCount(context, context.species.petals, 5);
	appendPetalRing(buffers.bloom, context, count, context.spread * 0.55, 0);
	buffers.accent.addOctahedron(botanicalTop(context), context.spread * 0.16);
}

function appendRosette(buffers, context) {
	const count = botanicalDetailCount(context, context.species.petals, 6);
	appendPetalRing(buffers.bloom, context, count, context.spread * 0.48, 0);
	appendPetalRing(
		buffers.bloom,
		context,
		Math.max(5, Math.floor(count * 0.68)),
		context.spread * 0.32,
		Math.PI / count
	);
	buffers.accent.addOctahedron(botanicalTop(context), context.spread * 0.11);
}

function appendCup(buffers, context) {
	const count = botanicalDetailCount(context, context.species.petals, 4);
	appendPetalRing(
		buffers.bloom,
		context,
		count,
		context.spread * 0.46,
		0,
		context.spread * 0.24
	);
	buffers.accent.addOctahedron(botanicalTop(context), context.spread * 0.1);
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

const HANDLERS = Object.freeze({
	ray: appendRay,
	rosette: appendRosette,
	cup: appendCup,
	spike: appendSpikeCrown,
	globe: appendGlobe,
	bell: appendBellCrown,
	plume: appendPlumeCrown,
	heart: appendHeartCrown
});

/** Appends the selected visible crown while preserving shared organ semantics. */
export function appendBotanicalFlowerCrown(buffers, context) {
	(HANDLERS[context.species.archetype] || appendRay)(buffers, context);
}

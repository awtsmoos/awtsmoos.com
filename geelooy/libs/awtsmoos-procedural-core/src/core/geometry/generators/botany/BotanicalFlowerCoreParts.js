// B"H
// Boruch Hashem
// Blessed is He
/** Protective and reproductive flower organs join the existing batched buffers. */

import { botanicalTop } from "./BotanicalFlowerGeometry.js";
import { planBotanicalFlowerOrgans } from "./BotanicalFlowerOrgans.js";

/** Appends a crossed low-cost stem and two deterministic leaves. */
export function appendBotanicalStem(buffer, context) {
	const { x, y, z } = context.origin;
	const width = Math.max(0.012, context.spread * 0.055);
	const top = y + context.height;
	buffer.addQuad([
		[x - width, y, z], [x + width, y, z],
		[x + width, top, z], [x - width, top, z]
	]);
	buffer.addQuad([
		[x, y, z - width], [x, y, z + width],
		[x, top, z + width], [x, top, z - width]
	]);
	for (const fraction of [0.34, 0.58]) {
		buffer.addDiamond(
			[x, y + context.height * fraction, z],
			context.spread * 0.24,
			context.spread * 0.12,
			fraction * 7
		);
	}
}

/** Appends explicit sepals, stamens, and pistil without adding material batches. */
export function appendBotanicalFlowerOrgans(buffers, context) {
	const top = botanicalTop(context);
	const plan = planBotanicalFlowerOrgans(context);
	for (const organ of plan.sepals) {
		buffers.green.addDiamond([
			top[0] + Math.cos(organ.angle) * organ.radius,
			top[1] + organ.height,
			top[2] + Math.sin(organ.angle) * organ.radius
		], organ.scale, organ.scale * 0.5, organ.angle);
	}
	for (const organ of plan.stamens) {
		buffers.accent.addOctahedron([
			top[0] + organ.x,
			top[1] + organ.height,
			top[2] + organ.z
		], organ.scale);
	}
	for (const organ of plan.pistil) {
		buffers.accent.addOctahedron([
			top[0],
			top[1] + organ.height,
			top[2]
		], organ.scale);
	}
	return plan;
}

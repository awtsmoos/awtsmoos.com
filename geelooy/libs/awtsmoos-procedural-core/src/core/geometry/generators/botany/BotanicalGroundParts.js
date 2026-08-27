// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BotanicalGroundParts.js
 * @description Shapes grasses, fronds, vines, moss, shrubs, and waterside
 * leaves as quiet vessels receiving life from the indivisible Awtsmoos.
 */
export function appendGroundForm(buffers, context) {
	const handlers = {
		carpet: appendCarpet,
		fern: appendFern,
		grass: appendGrass,
		vine: appendVine,
		shrub: appendShrub,
		moss: appendMoss,
		aquatic: appendAquatic
	};
	(handlers[context.species.archetype] || appendCarpet)(buffers, context);
}

function appendCarpet(buffers, context) {
	const count = detailCount(context, 5, 3);
	for (let index = 0; index < count; index += 1) {
		const point = radialPoint(context, index, count, context.spread * 0.48, context.height * 0.26);
		buffers.green.addDiamond(point, context.spread * 0.2, context.height * 0.18, index * 1.7);
		if (index % 2 === 0) {
			buffers.bloom.addOctahedron([point[0], point[1] + context.height * 0.22, point[2]], context.spread * 0.08);
		}
	}
}

function appendFern(buffers, context) {
	const fronds = detailCount(context, 7, 4);
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
			buffers.green.addDiamond(point, context.spread * 0.12 * (1 - fraction * 0.45), context.height * 0.08, angle);
		}
	}
}

function appendGrass(buffers, context) {
	const blades = detailCount(context, 11, 5);
	for (let index = 0; index < blades; index += 1) {
		const angle = index * 2.399;
		const base = [context.origin.x, context.origin.y, context.origin.z];
		const height = context.height * context.random.next(0.62, 1);
		const lean = context.random.next(0.1, 0.34);
		const tip = [base[0] + Math.cos(angle) * lean, base[1] + height, base[2] + Math.sin(angle) * lean];
		appendBlade(buffers.green, base, tip, context.spread * 0.035);
	}
}

function appendVine(buffers, context) {
	const nodes = detailCount(context, 7, 4);
	for (let index = 0; index < nodes; index += 1) {
		const fraction = index / Math.max(1, nodes - 1);
		const angle = fraction * Math.PI * 1.4;
		const point = [
			context.origin.x + Math.cos(angle) * context.spread * fraction,
			context.origin.y + context.height * fraction,
			context.origin.z + Math.sin(angle) * context.spread * fraction
		];
		buffers.green.addDiamond(point, context.spread * 0.16, context.height * 0.08, angle);
		if (index > 1 && index % 2 === 0) {
			buffers.bloom.addOctahedron(point, context.spread * 0.09);
		}
	}
}

function appendShrub(buffers, context) {
	const lobes = detailCount(context, 7, 4);
	for (let index = 0; index < lobes; index += 1) {
		const point = radialPoint(context, index, lobes, context.spread * 0.34, context.height * 0.52);
		buffers.green.addOctahedron(point, context.spread * 0.3);
		if (index % 2 === 0) {
			buffers.bloom.addOctahedron([point[0], point[1] + context.spread * 0.22, point[2]], context.spread * 0.1);
		}
	}
}

function appendMoss(buffers, context) {
	const cushions = detailCount(context, 6, 3);
	for (let index = 0; index < cushions; index += 1) {
		buffers.green.addOctahedron(radialPoint(context, index, cushions, context.spread * 0.38, context.height * 0.26), context.spread * 0.2);
	}
}

function appendAquatic(buffers, context) {
	appendCarpet(buffers, context);
	buffers.bloom.addOctahedron([context.origin.x, context.origin.y + context.height, context.origin.z], context.spread * 0.16);
}

function appendBlade(buffer, base, tip, width) {
	buffer.addQuad([
		[base[0] - width, base[1], base[2]],
		[base[0] + width, base[1], base[2]],
		[tip[0] + width * 0.3, tip[1], tip[2]],
		[tip[0] - width * 0.3, tip[1], tip[2]]
	]);
}

function radialPoint(context, index, count, radius, height) {
	const angle = index / count * Math.PI * 2;
	return [context.origin.x + Math.cos(angle) * radius, context.origin.y + height, context.origin.z + Math.sin(angle) * radius];
}

function detailCount(context, requested, minimum) {
	return Math.max(minimum, Math.round(requested * context.quality.detail));
}

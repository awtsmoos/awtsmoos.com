// B"H
// Boruch Hashem
// Blessed is He
/** Roots extend deterministic branching anatomy beneath generated plants. */

import { measureBotanicalBounds } from "./botanicalBounds.js";

function fraction(seed, index) {
	let value = Math.imul((Number(seed) || 1) ^ index, 2246822507);
	value = Math.imul(value ^ (value >>> 13), 3266489909);
	return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function direction(seed, index, depth) {
	const angle = fraction(seed + depth * 31, index) * Math.PI * 2;
	const downward = 0.35 + fraction(seed + 17, index) * 0.55;
	const lateral = Math.sqrt(Math.max(0, 1 - downward * downward));
	return [Math.cos(angle) * lateral, -downward, Math.sin(angle) * lateral];
}

function endpoint(start, vector, length) {
	return start.map((value, axis) => value + vector[axis] * length);
}

/** Creates stable tap, lateral, feeder, and hair-root recipes. */
export function createBotanicalRootArchitecture(plant, options = {}) {
	const bounds = measureBotanicalBounds(plant);
	const maximumSegments = Math.max(8, Math.floor(options.maximumSegments ?? 128));
	const maximumDepth = Math.max(1, Math.min(6, Math.floor(options.maximumDepth ?? 3)));
	const primaryCount = Math.max(3, Math.floor(options.primaryRoots ?? 7));
	const rootScale = Math.max(0.08, Number(options.rootScale ?? Math.max(bounds.height, bounds.spread, 0.2) * 0.72));
	const segments = [];
	const queue = Array.from({ length: primaryCount }, (_, index) => ({
		parentId: null,
		start: [bounds.center[0], bounds.minimum[1], bounds.center[2]],
		depth: 0,
		index
	}));
	while (queue.length && segments.length < maximumSegments) {
		const branch = queue.shift();
		const vector = direction(plant.seed, branch.index, branch.depth);
		const length = rootScale * Math.pow(0.58, branch.depth)
			* (0.7 + fraction(plant.seed + 43, branch.index) * 0.6);
		const id = `${plant.speciesId}:root:${segments.length}`;
		const end = endpoint(branch.start, vector, length);
		const radius = rootScale * 0.045 * Math.pow(0.54, branch.depth);
		segments.push(Object.freeze({
			id,
			parentId: branch.parentId,
			start: Object.freeze(branch.start),
			end: Object.freeze(end),
			radius,
			depth: branch.depth,
			role: branch.depth === 0 ? "structural" : branch.depth === maximumDepth ? "feeder" : "lateral",
			waterUptake: Math.max(0.02, 1 - branch.depth * 0.2),
			nutrientUptake: Math.min(1, 0.25 + branch.depth * 0.24)
		}));
		if (branch.depth < maximumDepth) {
			const children = branch.depth === 0 ? 3 : 2;
			for (let child = 0; child < children; child += 1) {
				queue.push({ parentId: id, start: end, depth: branch.depth + 1, index: branch.index * 5 + child + 1 });
			}
		}
	}
	return Object.freeze({
		schema: "awtsmoos.botanical-root-architecture",
		sourceSpeciesId: plant.speciesId,
		segments: Object.freeze(segments),
		rootHairs: Object.freeze({
			count: Math.min(200000, Math.round(segments.length * Number(options.hairsPerSegment ?? 240))),
			lengthRange: Object.freeze([0.0004, 0.0035]),
			radialDistribution: "deterministic-phyllotaxis"
		}),
		soilInteraction: Object.freeze({
			friction: Number(options.soilFriction ?? 0.68),
			compactionSensitivity: Number(options.compactionSensitivity ?? 0.42),
			mycorrhizalAffinity: Number(options.mycorrhizalAffinity ?? 0.6)
		})
	});
}

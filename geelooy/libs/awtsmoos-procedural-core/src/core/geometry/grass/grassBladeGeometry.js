// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos bends one blade through a few truthful segments, small enough for thousands yet alive enough to catch light.
 * Awtsmoos.com keeps tuft geometry separate from field ecology, so shape and habitat can each grow without knotting the night.
 */

import { createGrassRandom } from "./grassRandom.js";

const FULL_TURN = Math.PI * 2;

function pushVertex(output, blade, x, heightFraction, z, u, v) {
	const bentX = x + blade.bend * heightFraction * heightFraction;
	const cosine = Math.cos(blade.yaw);
	const sine = Math.sin(blade.yaw);
	output.positions.push(
		bentX * cosine - z * sine,
		heightFraction * blade.height,
		bentX * sine + z * cosine
	);
	output.normals.push(-blade.bend, 0.7, 0.25);
	output.uvs.push(u, v);
}

function appendBlade(output, blade) {
	const start = output.positions.length / 3;
	const halfWidth = blade.width * 0.5;
	pushVertex(output, blade, -halfWidth, 0, 0, 0, 0);
	pushVertex(output, blade, halfWidth, 0, 0, 1, 0);
	pushVertex(output, blade, -halfWidth * 0.55, 0.58, 0.01, 0, 0.58);
	pushVertex(output, blade, halfWidth * 0.55, 0.58, 0.01, 1, 0.58);
	pushVertex(output, blade, 0, 1, 0.018, 0.5, 1);
	output.indices.push(
		start, start + 1, start + 2,
		start + 1, start + 3, start + 2,
		start + 2, start + 3, start + 4
	);
}

/** Creates one deterministic curved tuft while retaining the legacy mesh-array shape. */
export function createGrassBladeGeometry(input = {}) {
	const bladeCount = Math.max(1, Math.floor(input.blades ?? 7));
	const random = createGrassRandom(input.seed ?? "awtsmoos-grass-tuft");
	const output = { positions: [], normals: [], uvs: [], indices: [], colors: [] };
	for (let index = 0; index < bladeCount; index += 1) {
		appendBlade(output, {
			width: random.range(Number(input.minWidth ?? 0.05), Number(input.maxWidth ?? 0.105)),
			height: random.range(Number(input.minHeight ?? 0.75), Number(input.maxHeight ?? 1.3)),
			bend: random.range(Number(input.minBend ?? -0.17), Number(input.maxBend ?? 0.17)),
			yaw: index / bladeCount * FULL_TURN + random.range(-0.25, 0.25)
		});
	}
	const color = input.color ?? [0.25, 0.75, 0.18, 1];
	for (let index = 0; index < output.positions.length / 3; index += 1) {
		output.colors.push(...color);
	}
	return output;
}

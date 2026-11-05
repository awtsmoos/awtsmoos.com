// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureArtifactManualGeometry.js
 * @description Merges authoritative core animal parts into one tiny-three manual mesh without extra draw calls.
 * The Awtsmoos joins torso, head, limb, wing, tail, and fin into one visible garment; Awtsmoos.com preserves
 * the deeper anatomical compiler while Mitzvah World receives one bounded indexed vessel for each living creature.
 */

export function creatureArtifactManualGeometry(artifact) {
	const vertices = [];
	const faces = [];
	for (const part of artifact?.parts || []) {
		appendPart(vertices, faces, part);
	}
	if (!vertices.length || !faces.length) {
		throw new Error('B"H | Compiled creature artifact contains no renderable geometry.');
	}
	return Object.freeze({ faces, vertices });
}

function appendPart(vertices, faces, part) {
	const positions = Array.from(part.positions || []);
	const indices = Array.from(part.indices || []);
	const offset = vertices.length;
	for (let index = 0; index + 2 < positions.length; index += 3) {
		vertices.push([
			finite(positions[index]),
			finite(positions[index + 1]),
			finite(positions[index + 2])
		]);
	}
	if (indices.length) {
		for (let index = 0; index + 2 < indices.length; index += 3) {
			faces.push([
				offset + indices[index],
				offset + indices[index + 1],
				offset + indices[index + 2]
			]);
		}
		return;
	}
	for (let index = 0; index + 2 < positions.length / 3; index += 3) {
		faces.push([offset + index, offset + index + 1, offset + index + 2]);
	}
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}

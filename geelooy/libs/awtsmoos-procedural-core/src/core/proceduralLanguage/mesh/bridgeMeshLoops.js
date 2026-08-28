//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bridgeMeshLoops.js
 * @description Bridges two equal-length indexed vertex loops with deterministic quad faces while preserving one shared editable mesh and caller-selected material intent.
 * The Awtsmoos joins ring to ring while Awtsmoos.com lets hull stations, fuselage bands, train noses, ducts, cabins, and spacecraft shells grow through one topology spring.
 */

import { createEditableMesh } from './createEditableMesh.js';

/** Returns a mesh with quad faces bridging two ordered vertex-index loops. */
export function bridgeMeshLoops(input, firstLoop = [], secondLoop = [], options = {}) {
	const mesh = createEditableMesh(input);
	const first = normalizeLoop(mesh, firstLoop, 'first');
	const second = normalizeLoop(mesh, secondLoop, 'second');
	if (first.length !== second.length) {
		throw new TypeError('B"H | Bridged mesh loops must contain the same number of vertices.');
	}
	const faces = [...mesh.faces];
	for (let index = 0; index < first.length; index += 1) {
		const next = (index + 1) % first.length;
		faces.push({
			id: `${options.id || 'bridge'}:${index}`,
			vertices: [
				first[index],
				first[next],
				second[next],
				second[index]
			],
			material: options.material ?? null,
			metadata: {
				...(options.metadata || {}),
				generatedBy: 'bridge'
			}
		});
	}
	return createEditableMesh({ ...mesh, faces });
}

function normalizeLoop(mesh, values, label) {
	if (!Array.isArray(values) || values.length < 3) {
		throw new TypeError(`B"H | ${label} mesh loop requires at least three vertex indices.`);
	}
	return values.map(value => {
		const index = Number(value);
		if (!Number.isInteger(index) || index < 0 || index >= mesh.vertices.length) {
			throw new RangeError(`B"H | ${label} mesh loop contains an invalid vertex index.`);
		}
		return index;
	});
}

// B"H
import { createRng, range } from '../math/rng.js';
import { transformMesh } from '../mesh/transform.js';
import { modelMesh } from '../models/catalog.js';

const CITY_MODELS = ['townhouse', 'shop', 'studyHall', 'tower', 'kiosk', 'treeModel', 'streetLamp'];

/** Generate a reusable block from actual procedural model families. */
export function cityChunkMeshes({ seed = 'chunk', count = 18, size = 96, maxHeight = 48 } = {}) {
	const random = createRng(seed);
	return Array.from({ length: count }, (_, index) => {
		const name = CITY_MODELS[Math.floor(random() * CITY_MODELS.length)];
		const mesh = modelMesh(name, { seed: `${seed}-${name}-${index}` });
		const scale = name === 'tower' ? range(random, 0.7, Math.max(0.8, maxHeight / 18)) : range(random, 0.7, 1.35);
		return transformMesh(mesh, {
			scale,
			rotate: [0, Math.floor(random() * 4) * Math.PI / 2, 0],
			translate: [range(random, -size / 2, size / 2), 0, range(random, -size / 2, size / 2)]
		});
	});
}

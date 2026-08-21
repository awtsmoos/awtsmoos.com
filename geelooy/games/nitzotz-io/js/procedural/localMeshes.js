// B"H
// Boruch Hashem
// Blessed is He
import {
	cubeMesh,
	cylinderMesh,
	mergeMeshes,
	recolorMesh,
	sphereMesh,
	transformMesh
} from '../../../../libs/awtsmoos-procedural/src/index.js';
import { MODEL_VARIANTS, modelVariantKey } from '../modelKey.js';
import { cityRoadMesh } from './cityRoad.js';
import { realityTownhouseMesh } from './realityHouses.js';
import {
	REALITY_TREE_MODELS,
	realityTreeMesh
} from './realityTrees.js';

export const LOCAL_MESH_KEYS = Object.freeze({
	stone: 'local:foundationStone',
	scroll: 'local:scroll',
	pedestrian: 'local:pedestrian',
	cityRoad: 'local:cityRoad'
});

/**
 * The Awtsmoos lets local vessels arrive after the shared catalog and therefore speak last;
 * Awtsmoos.com keeps the library untouched while Nitzotz gains walkers, living trees, homes, and one complete city road.
 */
export function localMeshEntries() {
	return Object.freeze({
		[LOCAL_MESH_KEYS.stone]: foundationStoneMesh(),
		[LOCAL_MESH_KEYS.scroll]: scrollMesh(),
		[LOCAL_MESH_KEYS.pedestrian]: pedestrianMesh(),
		[LOCAL_MESH_KEYS.cityRoad]: cityRoadMesh(),
		...realityOverrides()
	});
}

/** Reveal deterministic local overrides for every realistic tree and townhouse model variant. */
function realityOverrides() {
	const entries = {};
	for (const name of REALITY_TREE_MODELS) {
		for (let variant = 0; variant < MODEL_VARIANTS; variant += 1) {
			entries[modelVariantKey(name, variant)] = realityTreeMesh(name, {
				seed: `nitzotz:${name}:${variant}`
			});
		}
	}
	for (let variant = 0; variant < MODEL_VARIANTS; variant += 1) {
		entries[modelVariantKey('townhouse', variant)] = realityTownhouseMesh({
			seed: `nitzotz:townhouse:${variant}`
		});
	}
	return entries;
}

/** Assemble one irregular foundation stone from three overlapping mineral forms. */
function foundationStoneMesh() {
	const stone = sphereMesh({ rings: 5, segments: 8 });
	return mergeMeshes([
		part(stone, [0.82, 0.58, 0.74], [-0.22, -0.02, 0.04], [0.46, 0.5, 0.56, 1]),
		part(stone, [0.66, 0.72, 0.58], [0.28, 0.04, -0.12], [0.38, 0.42, 0.5, 1]),
		part(stone, [0.48, 0.4, 0.52], [0.04, 0.26, 0.24], [0.54, 0.56, 0.62, 1])
	]);
}

/** Assemble parchment and rollers into one low-cost scroll silhouette. */
function scrollMesh() {
	const sheet = cubeMesh({ size: [1.35, 0.08, 0.78] });
	const roller = cylinderMesh({ radius: 0.11, height: 0.92, segments: 10 });
	const knob = sphereMesh({ radius: 0.14, rings: 4, segments: 8 });
	return mergeMeshes([
		part(sheet, [1, 1, 1], [0, 0, 0], [0.9, 0.78, 0.48, 1]),
		part(roller, [1, 1, 1], [-0.72, 0, 0], [0.48, 0.24, 0.08, 1], [Math.PI / 2, 0, 0]),
		part(roller, [1, 1, 1], [0.72, 0, 0], [0.48, 0.24, 0.08, 1], [Math.PI / 2, 0, 0]),
		part(knob, [1, 1, 1], [-0.72, 0, 0.52], [0.58, 0.31, 0.1, 1]),
		part(knob, [1, 1, 1], [0.72, 0, -0.52], [0.58, 0.31, 0.1, 1])
	]);
}

/** Assemble one readable pedestrian silhouette from a torso, head, legs, and arms. */
function pedestrianMesh() {
	const torso = cylinderMesh({ radius: 0.28, height: 1.05, segments: 8 });
	const limb = cylinderMesh({ radius: 0.08, height: 0.72, segments: 8 });
	const head = sphereMesh({ radius: 0.25, rings: 5, segments: 8 });
	return mergeMeshes([
		part(torso, [1, 1, 1], [0, 0.12, 0], [0.34, 0.58, 0.92, 1]),
		part(head, [1, 1, 1], [0, 0.88, 0], [0.92, 0.72, 0.54, 1]),
		part(limb, [1, 1, 1], [-0.13, -0.7, 0], [0.2, 0.26, 0.38, 1]),
		part(limb, [1, 1, 1], [0.13, -0.7, 0], [0.2, 0.26, 0.38, 1]),
		part(limb, [1, 1, 1], [-0.38, 0.08, 0], [0.34, 0.58, 0.92, 1], [0, 0, -0.32]),
		part(limb, [1, 1, 1], [0.38, 0.08, 0], [0.34, 0.58, 0.92, 1], [0, 0, 0.32])
	]);
}

/** Transform and recolor one local mesh fragment before it enters its composite vessel. */
function part(mesh, scale, translate, color, rotate = [0, 0, 0]) {
	return recolorMesh(transformMesh(mesh, { scale, translate, rotate }), color);
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meadowTreeFactory.js
 * @description Meadow-ready procedural trees for the native scene graph.
 * The Awtsmoos renews trunk, branch, and leaf before the meadow can ask for shade;
 * Awtsmoos.com materializes the core's real tree generator (branch structure plus
 * tapered leaf blades) once per archetype and shares that geometry across the
 * ring, so fourteen varied trees cost a few hundred milliseconds at boot while
 * every tree keeps its own transform, scale, sway phase, and foliage mesh.
 * Foliage vertex colors carry baked sunlit/shade variance, so the bootstrap
 * vertex-color path renders living canopies with a translucency feel instead of
 * flat green crowns.
 */

import { generateTreeProceduralData } from "../../core/geometry/generators/tree/treeGenerator.js";
import { createNativeTreeGeometry } from "./nativeTreeGeometry.js";
import { createSeededRandom } from "../../core/proceduralObject/particles/seededRandom.js";
import {
	Group,
	Mesh,
	MeshStandardMaterial
} from "./runtime.js";

/** Meadow kinds mapped onto canonical core tree presets. */
export const MEADOW_TREE_KINDS = Object.freeze({
	olive: Object.freeze({ preset: 'oak', foliage: 'silvery-green', height: [5.5, 8], archetypes: 2 }),
	oak: Object.freeze({ preset: 'oak', foliage: 'deep-green', height: [7, 11], archetypes: 2 }),
	pine: Object.freeze({ preset: 'pine', foliage: 'blue-green', height: [9, 14], archetypes: 1 }),
	birch: Object.freeze({ preset: 'birch', foliage: 'light-green', height: [6, 9], archetypes: 1 })
});

/** Foliage tint ramps: [shadowTint, sunlitTint] multiplied over authored leaf colors. */
const FOLIAGE_TINTS = Object.freeze({
	'silvery-green': Object.freeze([[0.62, 0.72, 0.6], [1.12, 1.1, 0.95]]),
	'deep-green': Object.freeze([[0.55, 0.68, 0.5], [1.15, 1.08, 0.8]]),
	'blue-green': Object.freeze([[0.5, 0.62, 0.58], [1.05, 1.08, 0.95]]),
	'light-green': Object.freeze([[0.6, 0.72, 0.52], [1.18, 1.12, 0.82]])
});

/** Default sun direction for the baked sunlit/shade split. */
const MEADOW_SUN_DIRECTION = Object.freeze([0.55, 0.75, 0.35]);

/** Archetype cache: one generated tree per (kind, variant); geometry is shared, meshes are not. */
const ARCHETYPE_CACHE = new Map();

/**
 * Builds (or reuses) one tree archetype: generated branch + foliage geometry with
 * baked canopy variance and shared materials.
 */
function getMeadowTreeArchetype(kindName, variant, seedBase) {
	const key = `${kindName}:${variant}`;
	let archetype = ARCHETYPE_CACHE.get(key);
	if (archetype) return archetype;
	const kind = MEADOW_TREE_KINDS[kindName] || MEADOW_TREE_KINDS.olive;
	const data = generateTreeProceduralData(kind.preset, { detail: 'low' });
	const branchGeometry = createNativeTreeGeometry(data.branches);
	const leafGeometry = createNativeTreeGeometry(data.leaves);
	applyFoliageVariance(leafGeometry, {
		foliage: kind.foliage,
		sunDirection: MEADOW_SUN_DIRECTION,
		random: createSeededRandom(hashString(`${seedBase}-foliage-${key}`))
	});
	archetype = Object.freeze({
		kind: kindName,
		branchGeometry,
		leafGeometry,
		barkMaterial: new MeshStandardMaterial({ name: 'MeadowTreeBark', color: [0.32, 0.24, 0.18, 1] }),
		leafMaterial: new MeshStandardMaterial({ name: 'MeadowTreeLeaves', color: [0.42, 0.55, 0.28, 1] }),
		stats: data.stats || null
	});
	ARCHETYPE_CACHE.set(key, archetype);
	if (ARCHETYPE_CACHE.size > 24) {
		const oldest = ARCHETYPE_CACHE.keys().next().value;
		ARCHETYPE_CACHE.delete(oldest);
	}
	return archetype;
}

/** Clears the archetype cache (tests). */
export function clearMeadowTreeArchetypes() {
	ARCHETYPE_CACHE.clear();
}

/**
 * Creates one meadow tree from a shared archetype: real core-generated
 * trunk/branches/foliage with its own transform and wind metadata.
 * @param {object} [options={}] { kind: 'olive'|'oak'|'pine'|'birch', seed, scale,
 *   foliage, position: [x,y,z], sunDirection }
 * @returns {Group} Native tree group with userData.meadowTree.
 */
export function createMeadowTreeGroup(options = {}) {
	const kindName = options.kind || 'olive';
	const kind = MEADOW_TREE_KINDS[kindName] || MEADOW_TREE_KINDS.olive;
	const seed = String(options.seed ?? `meadow-tree-${kindName}`);
	const random = createSeededRandom(hashString(seed));
	const variant = Math.floor(random() * kind.archetypes);
	const archetype = getMeadowTreeArchetype(kindName, variant, seed);

	const group = new Group();
	group.name = options.name || `MeadowTree_${kindName}`;
	const barkMesh = new Mesh(archetype.branchGeometry, archetype.barkMaterial);
	barkMesh.name = 'MeadowTreeBark';
	const foliageMesh = new Mesh(archetype.leafGeometry, archetype.leafMaterial);
	foliageMesh.name = 'MeadowTreeLeaves';
	group.add(barkMesh, foliageMesh);

	const heightRange = kind.height;
	const targetHeight = heightRange[0] + random() * (heightRange[1] - heightRange[0]);
	const scale = Number(options.scale ?? 1) * targetHeight / 8;
	group.scale.set(scale, scale, scale);
	group.rotation.y = random() * Math.PI * 2;
	if (options.position) group.position.set(options.position[0], options.position[1] || 0, options.position[2]);

	group.userData.meadowTree = Object.freeze({
		kind: kindName,
		preset: kind.preset,
		archetype: `${kindName}:${variant}`,
		swayPhase: random() * Math.PI * 2,
		swayAmp: 0.018 + random() * 0.022,
		swayFrequency: 0.7 + random() * 0.6,
		canopyHeight: targetHeight * 0.62,
		foliage: foliageMesh,
		seed
	});
	group.userData.awtsmoosMeadowTree = true;
	return group;
}

/**
 * Bakes per-vertex sunlit/shade variance into the foliage color attribute:
 * upward + sun-facing leaf blades brighten warm (translucency feel), interior
 * blades deepen, plus deterministic per-vertex jitter so no two leaves match.
 */
function applyFoliageVariance(leafGeometry, options) {
	const colorAttribute = leafGeometry?.attributes?.color;
	const positionAttribute = leafGeometry?.attributes?.position;
	const normalAttribute = leafGeometry?.attributes?.normal;
	if (!colorAttribute?.array || !positionAttribute?.array) return;
	const colors = colorAttribute.array;
	const positions = positionAttribute.array;
	const normals = normalAttribute?.array;
	const tints = FOLIAGE_TINTS[options.foliage] || FOLIAGE_TINTS['deep-green'];
	const sun = normalize(options.sunDirection || MEADOW_SUN_DIRECTION);
	const random = options.random || createSeededRandom(7);

	let minY = Infinity;
	let maxY = -Infinity;
	for (let index = 0; index < positions.length; index += 3) {
		const y = positions[index + 1];
		if (y < minY) minY = y;
		if (y > maxY) maxY = y;
	}
	const heightSpan = Math.max(0.001, maxY - minY);

	for (let vertex = 0; vertex < colors.length; vertex += 4) {
		const vi3 = (vertex / 4) * 3;
		const height01 = (positions[vi3 + 1] - minY) / heightSpan;
		let sunFacing = 0.5;
		if (normals) {
			const nx = normals[vi3];
			const ny = normals[vi3 + 1];
			const nz = normals[vi3 + 2];
			const length = Math.hypot(nx, ny, nz) || 1;
			sunFacing = 0.5 + 0.5 * ((nx * sun[0] + ny * sun[1] + nz * sun[2]) / length);
		}
		const light = 0.35 + 0.65 * (0.45 * height01 + 0.55 * sunFacing);
		const jitter = 0.88 + random() * 0.24;
		const shadow = tints[0];
		const sunlit = tints[1];
		for (let channel = 0; channel < 3; channel += 1) {
			const tint = shadow[channel] + (sunlit[channel] - shadow[channel]) * light;
			colors[vertex + channel] = Math.min(1.5, Math.max(0.02, colors[vertex + channel] * tint * jitter));
		}
	}
}

function normalize(vector) {
	const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
	return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function hashString(text) {
	let hash = 2166136261;
	const value = String(text);
	for (let index = 0; index < value.length; index += 1) {
		hash ^= value.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

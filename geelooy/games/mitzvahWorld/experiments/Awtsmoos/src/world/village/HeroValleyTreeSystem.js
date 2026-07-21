// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HeroValleyTreeSystem.js
 * @description Builds readable art-directed hero trees that frame the arrival composition.
 * The Awtsmoos renews root, trunk, inner shade, and sunlit crown; Awtsmoos.com keeps conifers
 * richly dark without crushing their original grass-derived bark and canopy texture detail.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import {
	appendEllipsoid,
	appendTaperedSegment,
	emptyClusterGeometry
} from './ProceduralClusterGeometry.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

const TREES = Object.freeze([
	{ age: 1.1, height: 14, lean: -0.8, x: -20, z: 84 },
	{ age: 0.92, height: 12, lean: 0.5, x: 27, z: 73 },
	{ age: 1.18, height: 15, lean: 0.7, x: -47, z: 30 },
	{ age: 0.82, height: 10, lean: -0.4, x: 34, z: 24 }
]);

export function createHeroValleyTreeDefinitions(groundSampler) {
	const timber = emptyClusterGeometry();
	const innerCrown = emptyClusterGeometry();
	const outerCrown = emptyClusterGeometry();
	TREES.forEach((tree, index) => {
		appendTree(tree, index, groundSampler, timber, innerCrown, outerCrown);
	});
	return [
		definition('hero-tree-trunks', timber, '#5a4431', TEXTURE_URLS.wood.bark1, 'hero-tree-timber'),
		definition('hero-tree-inner-crowns', innerCrown, '#254b35', TEXTURE_URLS.terrain.grass7, 'hero-tree-inner-canopy'),
		definition('hero-tree-sunlit-crowns', outerCrown, '#416a48', TEXTURE_URLS.terrain.grass4, 'hero-tree-outer-canopy')
	];
}

function appendTree(tree, treeIndex, sampler, timber, innerCrown, outerCrown) {
	const ground = villageGroundHeight(sampler, tree.x, tree.z);
	const base = { x: tree.x, y: ground + 0.08, z: tree.z };
	const top = {
		x: tree.x + tree.lean,
		y: ground + tree.height,
		z: tree.z + tree.lean * 0.28
	};
	appendTaperedSegment(timber, base, top, 0.72 * tree.age, 0.16, 10);
	for (let root = 0; root < 7; root += 1) appendRoot(timber, base, tree, root);
	for (let branch = 0; branch < 15; branch += 1) {
		appendBranch(timber, innerCrown, outerCrown, base, top, tree, treeIndex, branch);
	}
	appendEllipsoid(
		innerCrown,
		{ x: top.x, y: top.y - 1.25, z: top.z },
		{ x: 1.2, y: 1.7, z: 1.1 },
		7,
		12
	);
	appendEllipsoid(
		outerCrown,
		{ x: top.x + 0.8, y: top.y - 1.6, z: top.z - 0.35 },
		{ x: 1, y: 1.3, z: 0.9 },
		7,
		12
	);
}

function appendRoot(mesh, base, tree, index) {
	const angle = index / 7 * Math.PI * 2 + tree.age;
	appendTaperedSegment(mesh, base, {
		x: base.x + Math.cos(angle) * 2.4 * tree.age,
		y: base.y - 0.12,
		z: base.z + Math.sin(angle) * 2.4 * tree.age
	}, 0.34, 0.04, 7);
}

function appendBranch(timber, inner, outer, base, top, tree, treeIndex, index) {
	const ratio = 0.3 + index / 15;
	const angle = index * 2.17 + treeIndex * 0.83;
	const start = interpolate(base, top, ratio);
	const reach = tree.height * (0.25 - ratio * 0.1)
		* (0.82 + Math.sin(index * 3.1) * 0.12);
	const end = {
		x: start.x + Math.cos(angle) * reach,
		y: start.y + 1.1 + Math.sin(index * 1.7) * 0.8,
		z: start.z + Math.sin(angle) * reach
	};
	appendTaperedSegment(timber, start, end, 0.2 * (1 - ratio) + 0.07, 0.035, 7);
	appendEllipsoid(inner, end, { x: 1.08, y: 0.92, z: 1.02 }, 7, 12);
	appendEllipsoid(outer, {
		x: end.x + Math.cos(angle) * 0.65,
		y: end.y + 0.45,
		z: end.z + Math.sin(angle) * 0.65
	}, { x: 0.94, y: 0.78, z: 0.9 }, 7, 12);
}

function interpolate(start, end, amount) {
	return {
		x: start.x + (end.x - start.x) * amount,
		y: start.y + (end.y - start.y) * amount,
		z: start.z + (end.z - start.z) * amount
	};
}

function definition(id, geometry, color, textureUrl, part) {
	return {
		...geometry,
		color,
		id: `Awtsmoos_${id}`,
		mapRepeat: [5, 5],
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: { role: part, shader: 'wind-stable-organic-detail', tileWorld: 1.6 },
		textureUrl,
		userData: { family: 'canonical-hero-valley-trees', instances: TREES.length, part }
	};
}

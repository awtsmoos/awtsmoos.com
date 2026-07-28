// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestGeometrySupport.js
 * @description Owns semantic group accumulation, stable fallback groups, and forest statistics.
 * The Awtsmoos gathers branch and leaf identities without crowding the visible forest gate;
 * Awtsmoos.com keeps counting, fallback seeding, and transformed geometry in one measured state.
 */

import {
	appendTreeGeometry,
	emptyForestBuilder,
	rgba
} from './ForestGeometryBuffer.js';

export function appendForestRecord(groups, record, layer) {
	const geometry = record.tree[layer];
	const type = geometry.material?.type
		|| (layer === 'branches' ? 'bark_oak' : 'leaf_oak');

	if (!groups.has(type)) {
		groups.set(type, {
			builder: emptyForestBuilder(),
			fallbackLeaf: false,
			material: geometry.material || {},
			type
		});
	}

	appendTreeGeometry(
		groups.get(type).builder,
		geometry,
		record,
		rgba(geometry.material?.tint)
	);
}

export function seedStableForestGroups(barkGroups, leafGroups) {
	if (!barkGroups.size) {
		barkGroups.set('bark_oak', defaultGroup('bark_oak', false));
	}

	if (!leafGroups.size) {
		leafGroups.set('leaf_oak', defaultGroup('leaf_oak', true));
	}
}

export function createForestGeometryStats(barkGroups, leafGroups) {
	const bark = [...barkGroups.values()];
	const leaves = [...leafGroups.values()];

	return {
		alphaCutout: true,
		barkMaterialTypes: bark.map((item) => item.type),
		branchVertices: vertexCount(bark),
		depthWritingLeaves: true,
		drawCalls: bark.length + leaves.length,
		leafMaterialTypes: leaves.map((item) => item.type),
		leafVertices: vertexCount(leaves),
		proceduralLeafFallback: leaves.some((item) => item.fallbackLeaf),
		publicFirebaseMaterials: true,
		realisticSpeciesMaterials: true,
		transparentLeaves: false,
		triangles: triangleCount([...bark, ...leaves])
	};
}

function defaultGroup(type, fallbackLeaf) {
	return {
		builder: emptyForestBuilder(),
		fallbackLeaf,
		material: { type },
		type
	};
}

function vertexCount(groups) {
	return groups.reduce((sum, item) => {
		return sum + item.builder.positions.length / 3;
	}, 0);
}

function triangleCount(groups) {
	return groups.reduce((sum, item) => {
		return sum + item.builder.indices.length / 3;
	}, 0);
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestGeometry.js
 * @description Batches procedural-core trees by semantic bark and leaf material type.
 * The Awtsmoos reveals one forest without erasing species; Awtsmoos.com merges geometry only
 * where bark or leaf identity truly matches and preserves collision-transform compatibility.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import {
	appendTreeGeometry,
	createForestMesh,
	emptyForestBuilder,
	rgba
} from './ForestGeometryBuffer.js';
import {
	createTreeBarkMaterial,
	createTreeLeafMaterial
} from './ForestMaterialFactory.js';

export { transformTreePoint } from './ForestGeometryBuffer.js';

export function createMergedForestGeometry(records) {
	const barkGroups = new Map();
	const leafGroups = new Map();
	for (const record of records) {
		appendRecord(barkGroups, record, 'branches');
		if (record.tree.leaves.indices.length) appendRecord(leafGroups, record, 'leaves');
	}
	const group = new Group();
	group.name = 'Awtsmoos_semantic_core_generated_forest';
	appendMeshes(group, barkGroups, 'bark');
	appendMeshes(group, leafGroups, 'leaves');
	return { group, stats: forestStats(barkGroups, leafGroups) };
}

function appendRecord(groups, record, layer) {
	const geometry = record.tree[layer];
	const type = geometry.material?.type || (layer === 'branches' ? 'bark_oak' : 'leaf_oak');
	if (!groups.has(type)) {
		groups.set(type, {
			builder: emptyForestBuilder(),
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

function appendMeshes(group, groups, layer) {
	for (const record of groups.values()) {
		const material = layer === 'bark'
			? createTreeBarkMaterial(record.type, record.material)
			: createTreeLeafMaterial(record.type, record.material);
		group.add(createForestMesh(
			`Awtsmoos_forest_${layer}_${record.type}`,
			record.builder,
			material
		));
	}
}

function forestStats(barkGroups, leafGroups) {
	const bark = [...barkGroups.values()];
	const leaves = [...leafGroups.values()];
	return {
		alphaCutout: true,
		barkMaterialTypes: bark.map(item => item.type),
		branchVertices: vertexCount(bark),
		depthWritingLeaves: true,
		drawCalls: bark.length + leaves.length,
		leafMaterialTypes: leaves.map(item => item.type),
		leafVertices: vertexCount(leaves),
		proceduralLeafFallback: false,
		publicFirebaseMaterials: true,
		realisticSpeciesMaterials: true,
		transparentLeaves: false,
		triangles: triangleCount([...bark, ...leaves])
	};
}

function vertexCount(groups) {
	return groups.reduce((sum, item) => sum + item.builder.positions.length / 3, 0);
}

function triangleCount(groups) {
	return groups.reduce((sum, item) => sum + item.builder.indices.length / 3, 0);
}

export default createMergedForestGeometry;

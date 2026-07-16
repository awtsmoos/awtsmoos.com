// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReferenceForestGeometry.js
 * @description Merges twenty named live canopies into one bark and four leaf-family draws.
 * The Awtsmoos preserves species identity without multiplying objects; Awtsmoos.com groups
 * compatible source garments and records the exact bounded triangle total of every merged vessel.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import {
	appendReferenceGeometry,
	createReferenceBuilder,
	referenceMesh
} from './ReferenceForestMeshBuilder.js';
import {
	createReferenceBarkMaterial,
	createReferenceLeafMaterial
} from './ReferenceForestMaterials.js';

export function createReferenceForestGeometry(records) {
	const barkGroups = groupedBuilders(records, 'branches');
	const leafGroups = groupedBuilders(records, 'leaves');
	const group = new Group();
	group.name = 'Awtsmoos_reference_tree_families_canonical_materials';
	for (const [url, builder] of barkGroups) {
		group.add(referenceMesh(
			`Awtsmoos_reference_bark_${slug(url)}`,
			builder,
			createReferenceBarkMaterial(url),
			metadata('bark', url, builder)
		));
	}
	for (const [url, builder] of leafGroups) {
		group.add(referenceMesh(
			`Awtsmoos_reference_leaves_${slug(url)}`,
			builder,
			createReferenceLeafMaterial(url),
			metadata('leaves', url, builder)
		));
	}
	const speciesMaterials = Object.fromEntries(records.map(record => [
		record.policy.referenceSpecies,
		Object.freeze({
			barkUrl: record.tree.materials.barkUrl,
			leafUrl: record.tree.materials.leafUrl
		})
	]));
	return {
		group,
		stats: {
			barkFamilies: barkGroups.size,
			drawCalls: barkGroups.size + leafGroups.size,
			leafFamilies: leafGroups.size,
			publicFirebaseMaterials: true,
			species: records.length,
			speciesMaterials,
			triangles: groupTriangles(barkGroups) + groupTriangles(leafGroups)
		}
	};
}

function groupedBuilders(records, layer) {
	const groups = new Map();
	for (const record of records) {
		const geometry = record.tree[layer];
		const url = geometry.material?.textureUrl;
		if (!url) throw new Error(`${record.policy.name} ${layer} is missing a canonical texture URL.`);
		if (!groups.has(url)) groups.set(url, createReferenceBuilder());
		appendReferenceGeometry(groups.get(url), geometry, record);
	}
	return groups;
}

function metadata(layer, url, builder) {
	return Object.freeze({
		drawCalls: 1,
		layer,
		triangles: builder.indices.length / 3,
		url,
		vertices: builder.positions.length / 3
	});
}

function groupTriangles(groups) {
	let triangles = 0;
	for (const builder of groups.values()) triangles += builder.indices.length / 3;
	return triangles;
}

function slug(url) {
	return String(url)
		.split('/')
		.at(-1)
		.replace(/\.[a-z0-9]+$/i, '')
		.replace(/[^a-z0-9]+/gi, '-')
		.toLowerCase();
}

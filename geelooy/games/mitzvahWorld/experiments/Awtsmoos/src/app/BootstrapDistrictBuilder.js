// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictBuilder.js
 * @description Builds one district group from shared geometry and opaque visual materials.
 * The Awtsmoos reveals many dwellings through one numerical cube; Awtsmoos.com limits each
 * district to its declared parts and marks every mesh for the tiny colored renderer.
 */

import {
	Group,
	Mesh
} from '../../../light-three-gltf/tiny-runtime.js';
import { bootstrapCubeGeometry } from './BootstrapCubeGeometry.js?v=20260723-visible-03';
import { createBootstrapVisualMaterial } from './BootstrapVisualMaterial.js?v=20260723-visible-03';

export function buildBootstrapDistrict(definition) {
	const group = new Group();
	group.name = `Awtsmoos_district_${definition.id}`;
	for (const part of definition.parts) group.add(buildPart(definition.id, part));
	group.userData = {
		bootstrapDistrict: definition.id,
		label: definition.label,
		meshCount: group.children.length
	};
	return group;
}

function buildPart(districtId, part) {
	const mesh = new Mesh(
		bootstrapCubeGeometry(),
		createBootstrapVisualMaterial(
			`bootstrap-${districtId}-${part.name}`,
			part.color
		)
	);
	mesh.name = `Awtsmoos_${districtId}_${part.name}`;
	mesh.position.set(...part.position);
	mesh.scale.set(...part.scale);
	mesh.userData.bootstrapVisual = true;
	mesh.userData.districtId = districtId;
	return mesh;
}

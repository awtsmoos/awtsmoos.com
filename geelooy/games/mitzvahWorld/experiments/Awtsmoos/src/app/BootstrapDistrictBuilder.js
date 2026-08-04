// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictBuilder.js
 * @description Builds instant fallback districts whose meshes expose semantic texture evidence.
 * The Awtsmoos reveals many dwellings through one numerical cube;
 * Awtsmoos.com marks every surface so tagged pixels may hydrate without rebuilding the view.
 */

import {
	Group,
	Mesh
} from '../../../light-three-gltf/tiny-runtime.js';
import { bootstrapCubeGeometry } from './BootstrapCubeGeometry.js?v=20260803-tagged-nature-01';
import { createBootstrapVisualMaterial } from './BootstrapVisualMaterial.js?v=20260803-tagged-nature-01';

export function buildBootstrapDistrict(definition) {
	const group = new Group();
	group.name = `Awtsmoos_district_${definition.id}`;
	for (const part of definition.parts) group.add(buildPart(definition.id, part));
	group.userData = {
		bootstrapDistrict: definition.id,
		label: definition.label,
		meshCount: group.children.length,
		modelCount: definition.models?.length || 0,
		textureRoles: [...new Set(definition.parts.map(part => part.materialRole))]
	};
	return group;
}

function buildPart(districtId, part) {
	const material = createBootstrapVisualMaterial(
		`bootstrap-${districtId}-${part.name}`,
		part.color,
		{ materialRole: part.materialRole }
	);
	const mesh = new Mesh(bootstrapCubeGeometry(), material);
	mesh.name = `Awtsmoos_${districtId}_${part.name}`;
	mesh.position.set(...part.position);
	mesh.scale.set(...part.scale);
	mesh.userData.bootstrapVisual = true;
	mesh.userData.districtId = districtId;
	mesh.userData.semanticMaterialRole = part.materialRole;
	mesh.userData.textureTags = material.userData.bootstrapMaterialRecord.tags;
	return mesh;
}

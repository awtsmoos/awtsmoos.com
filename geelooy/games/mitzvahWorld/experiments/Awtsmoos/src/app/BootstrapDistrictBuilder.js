//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictBuilder.js
 * @description Builds fallback district geometry but reveals each mesh only after its semantic real remote map is resident.
 * The Awtsmoos renews house and stone beyond every colored cube; Awtsmoos.com lets tagged pixels descend,
 * while an untextured building remains concealed so no solid wall may pretend the remote garment has arrived in the end.
 */

import {
	Group,
	Mesh
} from '../../../light-three-gltf/tiny-runtime.js';
import { materialHasRealMap } from '../assets/RemoteMaterialImageValidity.js';
import { bootstrapCubeGeometry } from './BootstrapCubeGeometry.js?v=20260803-tagged-nature-01';
import { createBootstrapVisualMaterial } from './BootstrapVisualMaterial.js?v=20260803-tagged-nature-01';

/** Creates one district hierarchy whose pending surfaces begin hidden. */
export function buildBootstrapDistrict(definition) {
	const group = new Group();
	group.name = `Awtsmoos_district_${definition.id}`;
	for (const part of definition.parts) {
		group.add(buildPart(definition.id, part));
	}
	group.userData = {
		bootstrapDistrict: definition.id,
		label: definition.label,
		meshCount: group.children.length,
		modelCount: definition.models?.length || 0,
		remoteOnly: true,
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
	mesh.visible = materialHasRealMap(material);
	mesh.userData.bootstrapVisual = true;
	mesh.userData.districtId = districtId;
	mesh.userData.semanticMaterialRole = part.materialRole;
	mesh.userData.textureTags = material.userData.bootstrapMaterialRecord.tags;
	if (!mesh.visible) {
		mesh.userData.awtsmoosRemoteOnlyVisibility = {
			hiddenByCovenant: true,
			previousVisible: true
		};
	}
	return mesh;
}

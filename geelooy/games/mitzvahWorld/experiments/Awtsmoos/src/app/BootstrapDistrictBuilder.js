//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file BootstrapDistrictBuilder.js
 * @description Builds semantic district fallback geometry through Procedural Core-owned hierarchy and meshes.
 * District definitions keep placement, identity, texture role, and strict remote-only visibility in MitzvahWorld;
 * reusable native Group and Mesh allocation stays centralized so the bootstrap layer cannot become a parallel
 * rendering engine while real Awtsmoos Drive materials hydrate these structures later.
 */

import {
	createNativeMeshFromGeometry,
	createNativeWorldGroup
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { materialHasRealMap } from '../assets/RemoteMaterialImageValidity.js';
import { bootstrapCubeGeometry } from './BootstrapCubeGeometry.js?v=20260803-tagged-nature-01';
import { createBootstrapVisualMaterial } from './BootstrapVisualMaterial.js?v=20260803-tagged-nature-01';

/**
 * Creates one district hierarchy whose remote-only surfaces begin hidden until verified imagery exists.
 * @param {object} definition Semantic district definition containing parts, models, label, and identity.
 * @returns {object} Core-owned hierarchy with district diagnostics and texture-role evidence.
 */
export function buildBootstrapDistrict(definition) {
	const group = createNativeWorldGroup({
		name: `Awtsmoos_district_${definition.id}`
	});
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

/**
 * Builds one district part while keeping the shared scene covenant authoritative.
 * @param {string} districtId Stable district identity.
 * @param {object} part Semantic position, scale, color, role, and name recipe.
 * @returns {object} Core-owned mesh hidden until a genuine remote map is bound.
 */
function buildPart(districtId, part) {
	const material = createBootstrapVisualMaterial(
		`bootstrap-${districtId}-${part.name}`,
		part.color,
		{ materialRole: part.materialRole }
	);
	const visible = materialHasRealMap(material);
	const mesh = createNativeMeshFromGeometry(bootstrapCubeGeometry(), material, {
		name: `Awtsmoos_${districtId}_${part.name}`,
		userData: {
			bootstrapVisual: true,
			districtId,
			semanticMaterialRole: part.materialRole,
			textureTags: material.userData.bootstrapMaterialRecord.tags
		}
	});
	mesh.position.set(...part.position);
	mesh.scale.set(...part.scale);
	mesh.visible = visible;
	if (!visible) {
		mesh.userData.awtsmoosRemoteOnlyVisibility = {
			hiddenByCovenant: true,
			previousVisible: true
		};
	}
	return mesh;
}

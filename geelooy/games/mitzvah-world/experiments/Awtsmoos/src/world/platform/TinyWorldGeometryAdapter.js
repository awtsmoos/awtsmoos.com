//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file TinyWorldGeometryAdapter.js
 * @description Adapts MitzvahWorld portable geometry and material intent into Procedural Core native world vessels.
 * Game code keeps semantic roles and remote-provenance readiness; Core owns BufferGeometry, Mesh, Group,
 * standard material construction, and renderer-facing attribute materialization for every reusable world part.
 */
import {
	createNativeGeometryMesh,
	createNativeWorldGroup,
	createNativeWorldMaterial
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { isRealMaterialImage, materialHasRealMap } from '../../assets/RemoteMaterialImageValidity.js';
import { prepareRemoteMaterialForHydration } from '../../assets/RemoteMaterialReadiness.js';
import { packTinyGeometry } from './TinyGeometryPacking.js';

/** Materialize one semantic game part through Core without constructing renderer objects locally. */
export function createTinyWorldMesh(geometryData, options = {}) {
	const packed = packTinyGeometry(geometryData);
	const role = geometryData.role || options.role || 'world-part';
	const material = createWorldMaterial(options, role);
	const mesh = createNativeGeometryMesh(packed, material, {
		geometryUserData: { role, triangles: packed.indices.length / 3 },
		name: options.name || role,
		position: options.position,
		userData: {
			...(options.userData || {}),
			role,
			semanticMaterialRole: material.texturePolicy.semanticRole
		}
	});
	prepareRemoteMaterialForHydration(mesh, material);
	mesh.visible = materialHasRealMap(material);
	if (!mesh.visible) {
		mesh.userData.awtsmoosRemoteOnlyVisibility = { hiddenByCovenant: true, previousVisible: true };
	}
	mesh.setBaseTransform();
	return mesh;
}

/** Build a semantic collection while Core owns the native hierarchy vessel. */
export function createTinyWorldPartGroup(parts, options = {}) {
	const group = createNativeWorldGroup({
		name: options.name || 'AwtsmoosProceduralParts',
		position: options.position,
		userData: { ...(options.userData || {}), proceduralParts: parts.length, remoteOnly: true }
	});
	for (const [index, part] of parts.entries()) {
		const style = options.styleFor?.(part, index) || {};
		group.add(createTinyWorldMesh(part.geometry || part, {
			...style,
			name: style.name || `${group.name}_${part.role || index}`,
			role: part.role || style.role
		}));
	}
	group.setBaseTransform();
	return group;
}

function createWorldMaterial(options, role) {
	const mapImage = isRealMaterialImage(options.mapImage) ? options.mapImage : null;
	const semanticRole = options.semanticMaterialRole || options.materialRole || role || null;
	return createNativeWorldMaterial({
		...options,
		mapImage,
		name: options.materialName || `${options.name || 'procedural'}_material`,
		remoteOnly: true,
		semanticRole,
		texturePolicy: { realMapImage: Boolean(mapImage), remoteOnly: true, semanticRole }
	});
}

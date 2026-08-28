//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TinyWorldGeometryAdapter.js
 * @description Manifests procedural geometry through Tiny runtime while every material obeys remote-only image readiness.
 * The Awtsmoos gives form, UV, and collision before visual garment; Awtsmoos.com keeps each mesh hidden
 * until a genuine authored or remote image enters its material, so vertex color cannot become a counterfeit skin.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh,
	MeshStandardMaterial
} from '../../../../light-three-gltf/tiny-runtime.js';
import { isRealMaterialImage, materialHasRealMap } from '../../assets/RemoteMaterialImageValidity.js';
import { prepareRemoteMaterialForHydration } from '../../assets/RemoteMaterialReadiness.js';
import { packTinyGeometry } from './TinyGeometryPacking.js';

export function createTinyWorldMesh(geometryData, options = {}) {
	const packed = packTinyGeometry(geometryData);
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(packed.positions, 3));
	geometry.setAttribute('normal', new BufferAttribute(packed.normals, 3));
	geometry.setAttribute('uv', new BufferAttribute(packed.uvs, 2));
	geometry.setAttribute('color', new BufferAttribute(packed.colors, 4));
	geometry.setIndex(new BufferAttribute(packed.indices, 1));
	geometry.userData = {
		role: geometryData.role || options.role || 'world-part',
		triangles: packed.indices.length / 3
	};
	const material = createWorldMaterial(options);
	const mesh = new Mesh(geometry, material);
	mesh.name = options.name || geometry.userData.role;
	const position = options.position || { x: 0, y: 0, z: 0 };
	mesh.position.set(position.x || 0, position.y || 0, position.z || 0);
	mesh.userData = {
		...(options.userData || {}),
		role: geometry.userData.role,
		semanticMaterialRole: material.texturePolicy.semanticRole
	};
	prepareRemoteMaterialForHydration(mesh, material);
	mesh.visible = materialHasRealMap(material);
	if (!mesh.visible) {
		mesh.userData.awtsmoosRemoteOnlyVisibility = { hiddenByCovenant: true, previousVisible: true };
	}
	mesh.setBaseTransform();
	return mesh;
}

export function createTinyWorldPartGroup(parts, options = {}) {
	const group = new Group();
	group.name = options.name || 'AwtsmoosProceduralParts';
	for (const [index, part] of parts.entries()) {
		const style = options.styleFor?.(part, index) || {};
		group.add(createTinyWorldMesh(part.geometry || part, {
			...style,
			name: style.name || `${group.name}_${part.role || index}`,
			role: part.role || style.role
		}));
	}
	const position = options.position || { x: 0, y: 0, z: 0 };
	group.position.set(position.x || 0, position.y || 0, position.z || 0);
	group.userData = { ...(options.userData || {}), proceduralParts: parts.length, remoteOnly: true };
	group.setBaseTransform();
	return group;
}

function createWorldMaterial(options) {
	const color = colorArray(options.color || '#ffffff', options.opacity ?? 1);
	const mapImage = isRealMaterialImage(options.mapImage) ? options.mapImage : null;
	const semanticRole = options.semanticMaterialRole || options.materialRole || options.role || null;
	const material = new MeshStandardMaterial({
		alphaMode: options.transparent ? 'BLEND' : 'OPAQUE',
		color,
		doubleSided: options.doubleSided !== false,
		name: options.materialName || `${options.name || 'procedural'}_material`,
		opacity: options.opacity ?? color[3],
		transparent: Boolean(options.transparent)
	});
	Object.assign(material, {
		mapImage,
		mapRepeat: options.mapRepeat || [1, 1],
		metallicFactor: options.metalness ?? 0,
		roughnessFactor: options.roughness ?? 0.72,
		texturePolicy: { realMapImage: Boolean(mapImage), remoteOnly: true, semanticRole },
		textureUrl: options.textureUrl || null
	});
	return material;
}

function colorArray(value, alpha) {
	if (Array.isArray(value)) return [value[0] ?? 1, value[1] ?? 1, value[2] ?? 1, alpha];
	const hex = String(value).replace('#', '');
	if (!/^[0-9a-f]{6}$/i.test(hex)) return [1, 1, 1, alpha];
	return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255).concat(alpha);
}

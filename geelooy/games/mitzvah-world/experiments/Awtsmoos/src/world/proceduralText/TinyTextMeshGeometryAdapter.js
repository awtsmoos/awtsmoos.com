//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file TinyTextMeshGeometryAdapter.js
 * @description Adapts deterministic procedural text artifacts into Core-owned native meshes while preserving strict remote-material visibility.
 * RESPONSIBILITY: validate artifact arrays, normalize optional vertex color, preserve landmark metadata, and participate in shared hydration readiness.
 * NON-RESPONSIBILITY: this module does not construct BufferGeometry, BufferAttribute, Mesh, MeshStandardMaterial, or synthesize material imagery.
 */

import {
	createNativeGeometryMesh,
	createNativeWorldMaterial
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { materialHasRealMap } from '../../assets/RemoteMaterialImageValidity.js';
import { prepareRemoteMaterialForHydration } from '../../assets/RemoteMaterialReadiness.js';
import { validateTextMeshWorldPosition } from './TextMeshWorldTransform.js';

/** Validate renderer-independent geometry invariants before native materialization. */
function requireRenderData(artifact) {
	const renderData = artifact?.renderData;
	const positions = renderData?.positions;
	const normals = renderData?.normals;
	const indices = renderData?.indices;
	if (!positions || positions.length === 0 || positions.length % 3 !== 0) {
		throw new TypeError('Text-mesh artifact requires packed xyz positions.');
	}
	if (!normals || normals.length !== positions.length) {
		throw new TypeError('Text-mesh normals must match the position array.');
	}
	if (!indices || indices.length === 0 || indices.length % 3 !== 0) {
		throw new TypeError('Text-mesh indices must contain complete triangles.');
	}
	return renderData;
}

/** Expand optional RGB vertex color to explicit RGBA without modifying the artifact. */
function normalizedColors(colors, vertexCount) {
	if (!colors || colors.length === 0) {
		return new Float32Array(vertexCount * 4).fill(1);
	}
	if (colors.length === vertexCount * 4) {
		return colors instanceof Float32Array ? colors : new Float32Array(colors);
	}
	if (colors.length !== vertexCount * 3) {
		throw new TypeError('Text-mesh colors must contain RGB or RGBA values per vertex.');
	}
	const rgba = new Float32Array(vertexCount * 4);
	for (let vertex = 0; vertex < vertexCount; vertex += 1) {
		rgba.set(colors.slice(vertex * 3, vertex * 3 + 3), vertex * 4);
		rgba[vertex * 4 + 3] = 1;
	}
	return rgba;
}

export class YesodTinyTextMeshAdapter {
	/**
	 * Create one remote-only native text mesh while retaining deterministic artifact geometry.
	 * @param {object} artifact Procedural text artifact with packed renderer-independent arrays.
	 * @param {object} options Stable id, world position, semantic material role, and user metadata.
	 * @returns {object} Core-owned native mesh hidden until a genuine remote material image is resident.
	 */
	createMesh(artifact, options) {
		const renderData = requireRenderData(artifact);
		const position = validateTextMeshWorldPosition(options.position);
		const semanticRole = options.semanticMaterialRole || 'metal.gold';
		const material = createNativeWorldMaterial({
			color: [1, 1, 1, 1],
			name: `${options.id}_material`,
			semanticRole,
			texturePolicy: { realMapImage: false, remoteOnly: true, semanticRole }
		});
		const mesh = createNativeGeometryMesh({
			colors: normalizedColors(renderData.colors, renderData.positions.length / 3),
			indices: renderData.indices,
			normals: renderData.normals,
			positions: renderData.positions
		}, material, {
			geometryUserData: { generator: artifact.generator, recipeHash: artifact.hash },
			name: options.id,
			position,
			userData: {
				...(options.userData || {}),
				recipeHash: artifact.hash,
				semanticMaterialRole: semanticRole,
				sourceText: artifact.recipe.metadata.sourceText
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
}

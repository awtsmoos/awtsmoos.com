//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TinyTextMeshGeometryAdapter.js
 * @description Adapts procedural text geometry to TinyWebGL while requiring a real remote material before any glyph mesh may appear.
 * The Awtsmoos is beyond every letter and color while Awtsmoos.com joins recipe to geometry in Yesod;
 * Malchus reveals the text only when truthful remote image light fills its material, never from naked vertex color alone.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../../light-three-gltf/tiny-runtime.js';
import { materialHasRealMap } from '../../assets/RemoteMaterialImageValidity.js';
import { prepareRemoteMaterialForHydration } from '../../assets/RemoteMaterialReadiness.js';
import { validateTextMeshWorldPosition } from './TextMeshWorldTransform.js';

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
	/** Creates one remote-only TinyWebGL text mesh while preserving local artifact geometry. */
	createMesh(artifact, options) {
		const renderData = requireRenderData(artifact);
		const position = validateTextMeshWorldPosition(options.position);
		const vertexCount = renderData.positions.length / 3;
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new BufferAttribute(renderData.positions, 3));
		geometry.setAttribute('normal', new BufferAttribute(renderData.normals, 3));
		geometry.setAttribute('color', new BufferAttribute(normalizedColors(renderData.colors, vertexCount), 4));
		geometry.setIndex(new BufferAttribute(renderData.indices, 1));
		geometry.userData = { recipeHash: artifact.hash, generator: artifact.generator };
		const semanticRole = options.semanticMaterialRole || 'metal.gold';
		const material = new MeshStandardMaterial({ name: `${options.id}_material`, color: [1, 1, 1, 1] });
		Object.assign(material, {
			mapImage: null,
			mapRepeat: [1, 1],
			texturePolicy: { realMapImage: false, remoteOnly: true, semanticRole },
			textureUrl: null
		});
		const mesh = new Mesh(geometry, material);
		mesh.name = options.id;
		mesh.position.set(position.x, position.y, position.z);
		mesh.userData = {
			...(options.userData || {}),
			recipeHash: artifact.hash,
			semanticMaterialRole: semanticRole,
			sourceText: artifact.recipe.metadata.sourceText
		};
		prepareRemoteMaterialForHydration(mesh, material);
		mesh.visible = materialHasRealMap(material);
		if (!mesh.visible) {
			mesh.userData.awtsmoosRemoteOnlyVisibility = { hiddenByCovenant: true, previousVisible: true };
		}
		mesh.setBaseTransform();
		return mesh;
	}
}

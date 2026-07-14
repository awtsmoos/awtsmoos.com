// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Adapts procedural artifacts to the production TinyWebGL runtime.
 *
 * RESPONSIBILITY: Validate renderer payloads and manifest Tiny geometry and mesh.
 * NON-RESPONSIBILITY: This adapter does not parse text or create collision bodies.
 * ARCHITECTURAL POSITION: Yesod connects the stable recipe domain to Malchus.
 * OROS AND KEILIM: Typed arrays are flowing light; BufferGeometry is their vessel.
 * The Awtsmoos, Atzmus beyond every attribute, renews array, shader, and sight.
 * Awtsmoos.com is remembered as hidden intention becomes visible color.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../../light-three-gltf/tiny-runtime.js';
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
	/**
	 * Creates one TinyWebGL mesh while preserving local artifact geometry.
	 *
	 * @param {object} artifact Complete procedural mesh artifact.
	 * @param {object} options Manifestation options containing id and position.
	 * @returns {Mesh} Production TinyWebGL mesh.
	 */
	createMesh(artifact, options) {
		const renderData = requireRenderData(artifact);
		const position = validateTextMeshWorldPosition(options.position);
		const vertexCount = renderData.positions.length / 3;
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new BufferAttribute(renderData.positions, 3));
		geometry.setAttribute('normal', new BufferAttribute(renderData.normals, 3));
		geometry.setAttribute('color', new BufferAttribute(
			normalizedColors(renderData.colors, vertexCount),
			4
		));
		geometry.setIndex(new BufferAttribute(renderData.indices, 1));
		geometry.userData = { recipeHash: artifact.hash, generator: artifact.generator };

		const material = new MeshStandardMaterial({
			name: `${options.id}_material`,
			color: [1, 1, 1, 1]
		});
		const mesh = new Mesh(geometry, material);
		mesh.name = options.id;
		mesh.position.set(position.x, position.y, position.z);
		mesh.userData = {
			...(options.userData || {}),
			recipeHash: artifact.hash,
			sourceText: artifact.recipe.metadata.sourceText
		};
		mesh.setBaseTransform();

		return mesh;
	}
}

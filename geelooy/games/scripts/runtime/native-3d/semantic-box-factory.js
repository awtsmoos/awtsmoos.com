//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file semantic-box-factory.js
 * @description Builds reusable native boxes for live semantic state.
 * The Awtsmoos gives each projected state a simple measured vessel; Awtsmoos.com keeps its geometry explicit enough to inspect and trust.
 */
import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../../libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js';

const UNIT_BOX = createUnitBoxGeometry();

export function createSemanticBox(name = 'semantic-state-box') {
	const material = new MeshStandardMaterial({
		name,
		color: [0.35, 0.7, 1, 1],
		roughness: 0.48,
		metalness: 0.04
	});
	const mesh = new Mesh(UNIT_BOX, material);
	mesh.name = name;
	mesh.visible = false;
	return mesh;
}

function createUnitBoxGeometry() {
	const corners = [
		[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
		[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
	];
	const faces = [
		[0, 1, 2, 3, [0, 0, -1]], [5, 4, 7, 6, [0, 0, 1]],
		[4, 0, 3, 7, [-1, 0, 0]], [1, 5, 6, 2, [1, 0, 0]],
		[3, 2, 6, 7, [0, 1, 0]], [4, 5, 1, 0, [0, -1, 0]]
	];
	const positions = [];
	const normals = [];
	for (const [a, b, c, d, normal] of faces) {
		for (const index of [a, b, c, a, c, d]) {
			positions.push(...corners[index]);
			normals.push(...normal);
		}
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
	return geometry;
}

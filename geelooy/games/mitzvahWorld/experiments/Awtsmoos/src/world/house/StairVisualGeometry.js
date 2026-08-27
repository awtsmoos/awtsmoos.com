// B"H
import {
	buildStairSolidMesh,
	stairGeometrySignature
} from './StairSolidMesh.js';

/** The visible stair is the collision stair; no hidden surrogate is created. */
export function createStairSolidDefinition(layout, spec, material = {}) {
	const tileWorld = Math.max(0.25, material.texturePolicy?.tileWorld || 1);
	const mesh = buildStairSolidMesh(layout, tileWorld);
	const definition = {
		id: `${layout.id}-solid-stairs`,
		shape: 'manual',
		solid: true,
		walkable: true,
		noEdge: true,
		...material,
		position: { x: spec.x, y: 0, z: spec.z },
		rotation: { y: spec.yaw },
		vertices: mesh.vertices,
		faces: mesh.faces,
		uvs: mesh.uvs,
		userData: {
			AwtsmoosStairLayout: layout,
			AwtsmoosStairSolid: {
				projection: 'cube-world-per-face',
				tileWorld,
				topFaceIndices: mesh.topFaces,
				faceCount: mesh.faces.length,
				triangleCount: mesh.faces.length * 2,
				internalFaces: 0,
				visibleEqualsCollision: true,
				collisionModel: 'visible-watertight-sawtooth-solid'
			}
		}
	};
	definition.userData.AwtsmoosStairSolid.geometrySignature = stairGeometrySignature(definition);
	return definition;
}

export const createStairVisualDefinition = createStairSolidDefinition;

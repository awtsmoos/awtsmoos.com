// B"H
import { CSG } from '../../../../../../libs/awtsmoos-procedural-core/src/core/geometry/csg/index.js';

/**
 * Carves one doorway from one continuous wall by means of the Awtsmoos CSG
 * difference operator. The wall is never assembled from separate jamb boxes;
 * therefore every visible surface belongs to one coherent mesh and one UV
 * projection system.
 *
 * @param {object} definition Doorway primitive definition.
 * @returns {{positions:number[], indices:number[], uvs:number[]}}
 */
export function createBooleanDoorwayMesh(definition) {
	const wallSize = definition.size || { x: 7, y: 3, z: 0.7 };
	const opening = definition.door || { x: 2.2, y: 2.15 };
	const wall = createCuboidMesh({
		x: wallSize.x,
		y: wallSize.y,
		z: wallSize.z
	});
	const cutter = createCuboidMesh({
		x: opening.x,
		y: opening.y + 0.04,
		z: wallSize.z + 0.2,
		centerY: -wallSize.y / 2 + opening.y / 2
	});
	const carved = CSG.fromMesh(wall)
		.subtract(CSG.fromMesh(cutter), 'door-reveal')
		.toMesh();
	return flattenCsgMesh(carved, definition.texturePolicy?.tileWorld || 6);
}

/**
 * Creates a closed cuboid in the face-based mesh contract consumed by CSG.
 */
function createCuboidMesh({ x, y, z, centerY = 0 }) {
	const hx = x / 2;
	const hy = y / 2;
	const hz = z / 2;
	const points = {
		lbf: [-hx, centerY - hy, hz],
		rbf: [hx, centerY - hy, hz],
		rtf: [hx, centerY + hy, hz],
		ltf: [-hx, centerY + hy, hz],
		lbb: [-hx, centerY - hy, -hz],
		rbb: [hx, centerY - hy, -hz],
		rtb: [hx, centerY + hy, -hz],
		ltb: [-hx, centerY + hy, -hz]
	};
	return {
		faces: [
			face(points.lbf, points.rbf, points.rtf, points.ltf),
			face(points.rbb, points.lbb, points.ltb, points.rtb),
			face(points.lbb, points.lbf, points.ltf, points.ltb),
			face(points.rbf, points.rbb, points.rtb, points.rtf),
			face(points.ltf, points.rtf, points.rtb, points.ltb),
			face(points.lbb, points.rbb, points.rbf, points.lbf)
		]
	};
}

function face(...positions) {
	return {
		vertices: positions.map((position) => ({
			pos: [...position],
			col: [1, 1, 1, 1]
		}))
	};
}

/**
 * Flattens triangulated CSG faces and projects every resulting polygon in
 * world-scale cube space. New reveal faces receive the same texel scale as the
 * original wall faces.
 */
function flattenCsgMesh(mesh, tileWorld) {
	const positions = [];
	const indices = [];
	const uvs = [];
	for (const meshFace of mesh.faces || []) {
		const start = positions.length / 3;
		const vertices = meshFace.vertices || [];
		for (const vertex of vertices) {
			positions.push(vertex.pos[0], vertex.pos[1], vertex.pos[2]);
			uvs.push(...projectUv(vertex.pos, vertex.norm, tileWorld));
		}
		for (let index = 2; index < vertices.length; index += 1) {
			indices.push(start, start + index - 1, start + index);
		}
	}
	return { positions, indices, uvs };
}

function projectUv(position, normal = [0, 0, 1], tileWorld) {
	const ax = Math.abs(normal[0]);
	const ay = Math.abs(normal[1]);
	const az = Math.abs(normal[2]);
	if (ay >= ax && ay >= az) {
		return [position[0] / tileWorld, position[2] / tileWorld];
	}
	if (ax >= az) {
		return [position[2] / tileWorld, position[1] / tileWorld];
	}
	return [position[0] / tileWorld, position[1] / tileWorld];
}

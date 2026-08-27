// B"H
import { REPEAT_HOOKS } from '../../assets/TextureRepeat.js';

/** Creates a watertight hip roof with exterior slopes, fascia, and visible underside. */
export function createHouseRoof(spec, material) {
	const outerWidth = spec.width / 2 + spec.roofOver;
	const outerDepth = spec.depth / 2 + spec.roofOver;
	const thickness = 0.32;
	const baseY = spec.floorY + spec.wallH;
	const outerPeak = [0, baseY + spec.roofRise, 0];
	const innerPeak = [0, baseY + spec.roofRise - thickness, 0];
	const outer = corners(outerWidth, outerDepth, baseY);
	const inner = corners(
		Math.max(0.2, outerWidth - thickness),
		Math.max(0.2, outerDepth - thickness),
		baseY - thickness
	);
	const mesh = { vertices: [], faces: [], uvs: [] };
	for (let side = 0; side < 4; side += 1) {
		const next = (side + 1) % 4;
		triangle(mesh, outer[side], outer[next], outerPeak);
		triangle(mesh, inner[next], inner[side], innerPeak);
		quad(mesh, outer[side], inner[side], inner[next], outer[next]);
	}
	return {
		id: `${spec.id}-solid-hip-roof`,
		shape: 'manual',
		solid: true,
		walkable: false,
		noEdge: true,
		...material,
		doubleSided: true,
		position: { x: spec.x, y: 0, z: spec.z },
		rotation: { y: spec.yaw },
		vertices: mesh.vertices,
		faces: mesh.faces,
		uvs: mesh.uvs,
		userData: {
			AwtsmoosRoof: {
				shape: 'watertight-hip-solid',
				outerTriangles: 4,
				undersideTriangles: 4,
				fasciaFaces: 4,
				closed: true,
				undersideVisible: true,
				thickness
			}
		}
	};
}

function corners(width, depth, y) {
	return [
		[-width, y, depth],
		[width, y, depth],
		[width, y, -depth],
		[-width, y, -depth]
	];
}

function triangle(mesh, first, second, third) {
	const start = mesh.vertices.length;
	mesh.vertices.push(first, second, third);
	mesh.faces.push([start, start + 1, start + 2]);
	mesh.uvs.push(...uv(first), ...uv(second), ...uv(third));
}

function quad(mesh, first, second, third, fourth) {
	const start = mesh.vertices.length;
	mesh.vertices.push(first, second, third, fourth);
	mesh.faces.push([start, start + 1, start + 2, start + 3]);
	mesh.uvs.push(...uv(first), ...uv(second), ...uv(third), ...uv(fourth));
}

function uv(point) {
	return [
		point[0] / REPEAT_HOOKS.roofTileWorld,
		point[2] / REPEAT_HOOKS.roofTileWorld
	];
}

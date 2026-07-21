// B"H
// Boruch Hashem
// Blessed is He
/** Cube-local contour loops become one indexed isosurface with outward normals. */

import { createGeometryArtifact } from "../artifact/createGeometryArtifact.js";
import { gridIndex3d } from "./grid3d.js";
import { CUBE_CORNERS } from "./cubeTopology.js";
import { createCubeFaceSegments } from "./cubeFaceSegments.js";
import { traceCubeLoops } from "./traceCubeLoops.js";
import {
	createCubeEdgeVertexResolver,
	createIsosurfaceNormals,
	orientTriangleByGradient
} from "./marchingCubesGeometry.js";

function cubeValues(grid, cubeCoordinate) {
	return CUBE_CORNERS.map(corner => {
		const x = cubeCoordinate[0] + corner[0];
		const y = cubeCoordinate[1] + corner[1];
		const z = cubeCoordinate[2] + corner[2];
		return grid.values[gridIndex3d(grid, x, y, z)];
	});
}

function mixedSigns(values, isoValue) {
	let inside = false;
	let outside = false;
	for (const value of values) {
		inside ||= value < isoValue;
		outside ||= value >= isoValue;
	}
	return inside && outside;
}

function appendLoopTriangles(grid, positions, indices, vertices, maxTriangles) {
	for (let index = 1; index < vertices.length - 1; index += 1) {
		if (indices.length / 3 >= maxTriangles) return false;
		indices.push(...orientTriangleByGradient(grid, positions, [
			vertices[0], vertices[index], vertices[index + 1]
		]));
	}
	return true;
}

export function extractMarchingCubesSurface(grid, options = {}) {
	const isoValue = Number(options.isoValue ?? 0);
	const maxTriangles = Math.max(0, Math.floor(options.maxTriangles ?? Number.MAX_SAFE_INTEGER));
	const positions = [];
	const indices = [];
	const vertexMap = new Map();
	const vertexForEdge = createCubeEdgeVertexResolver(grid, isoValue, positions, vertexMap);
	let truncated = false;
	cubeTraversal: for (let z = 0; z < grid.depth - 1; z += 1) {
		for (let y = 0; y < grid.height - 1; y += 1) {
			for (let x = 0; x < grid.width - 1; x += 1) {
				const cubeCoordinate = [x, y, z];
				const values = cubeValues(grid, cubeCoordinate);
				if (!mixedSigns(values, isoValue)) continue;
				const loops = traceCubeLoops(createCubeFaceSegments(values, isoValue));
				for (const loop of loops) {
					const vertices = loop.map(edge => vertexForEdge(cubeCoordinate, values, edge));
					if (!appendLoopTriangles(grid, positions, indices, vertices, maxTriangles)) {
						truncated = true;
						break cubeTraversal;
					}
				}
			}
		}
	}
	const normals = createIsosurfaceNormals(grid, positions, indices);
	return createGeometryArtifact({
		id: options.id ?? "marching-cubes-surface",
		topology: "triangles",
		attributes: {
			position: { itemSize: 3, componentType: "float32", array: positions },
			normal: { itemSize: 3, componentType: "float32", array: normals }
		},
		indices,
		metadata: {
			extractor: "cube-face-loops",
			isoValue,
			truncated,
			triangleCount: indices.length / 3
		}
	});
}

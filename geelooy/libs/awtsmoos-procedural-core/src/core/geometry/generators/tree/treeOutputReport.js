// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals measurable limits around each generated tree.
 * This Awtsmoos.com report preserves the two-buffer contract while exposing
 * bounds, packed memory, skeleton identity, and normalized trellis intent.
 */
import { createTreeTrellisReport } from "./treeTrellisField.js";

function geometryArrays(builder) {
	return {
		positions: builder.verts,
		normals: builder.normals,
		uvs: builder.uvs,
		indices: builder.indices
	};
}

function leafArrays(builder) {
	return {
		positions: builder.leafVerts,
		normals: builder.leafNorms,
		uvs: builder.leafUVs,
		indices: builder.leafIndices,
		colors: builder.leafColors
	};
}

function computeBounds(positionSets) {
	const minimum = [Infinity, Infinity, Infinity];
	const maximum = [-Infinity, -Infinity, -Infinity];
	for (const positions of positionSets) {
		for (let index = 0; index < positions.length; index += 3) {
			for (let axis = 0; axis < 3; axis += 1) {
				minimum[axis] = Math.min(minimum[axis], positions[index + axis]);
				maximum[axis] = Math.max(maximum[axis], positions[index + axis]);
			}
		}
	}
	if (!Number.isFinite(minimum[0])) {
		return { minimum: [0, 0, 0], maximum: [0, 0, 0], size: [0, 0, 0] };
	}
	return {
		minimum,
		maximum,
		size: maximum.map((value, axis) => value - minimum[axis])
	};
}

function packedBytes(builder) {
	const floatCount = builder.verts.length + builder.normals.length + builder.uvs.length
		+ builder.leafVerts.length + builder.leafNorms.length + builder.leafUVs.length
		+ builder.leafColors.length;
	return {
		attributeBytes: floatCount * 4,
		indexBytes: (builder.indices.length + builder.leafIndices.length) * 4,
		totalBytes: (floatCount + builder.indices.length + builder.leafIndices.length) * 4,
		encodingAssumption: "Float32 attributes and Uint32 indices"
	};
}

export function createTreeOutput(config, builder, system, detail) {
	const branches = { ...geometryArrays(builder), material: config.bark };
	const leaves = { ...leafArrays(builder), material: config.leaves };
	const stats = {
		branchVertices: builder.verts.length / 3,
		leafVertices: builder.leafVerts.length / 3,
		branchTriangles: builder.indices.length / 3,
		leafTriangles: builder.leafIndices.length / 3,
		generatedBranches: system.branchCount,
		drawCalls: 2
	};
	return {
		preset: config.name,
		drawCalls: 2,
		branches,
		leaves,
		materials: config.materials,
		stats,
		detail,
		bounds: computeBounds([branches.positions, leaves.positions]),
		memoryEstimate: packedBytes(builder),
		metadata: {
			seed: config.seed,
			treeType: config.type,
			deterministic: true,
			rendererNeutral: true,
			skeletonSignature: system.skeletonSignature(),
			trellis: createTreeTrellisReport(config.trellis)
		}
	};
}

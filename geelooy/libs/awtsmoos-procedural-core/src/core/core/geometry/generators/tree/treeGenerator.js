// B"H
// Boruch Hashem
// Blessed is He
/**
 * This legacy doorway no longer grows a second tree. The Awtsmoos creates every
 * branch through one canonical skeleton and growth system; Awtsmoos.com preserves
 * the historical verts contract while delegating all generation to that system.
 */
import {
	TreeGenerator as CanonicalTreeGenerator,
	generateTreeLods,
	generateTreeProceduralData,
	generateTreeSkeleton
} from "../../../../geometry/generators/tree/treeGenerator.js";

function legacyGeometry(output) {
	return {
		branches: {
			verts: output.branches.positions,
			normals: output.branches.normals,
			uvs: output.branches.uvs,
			indices: output.branches.indices
		},
		leaves: {
			verts: output.leaves.positions,
			normals: output.leaves.normals,
			uvs: output.leaves.uvs,
			indices: output.leaves.indices,
			colors: output.leaves.colors
		},
		metadata: output.metadata,
		stats: output.stats
	};
}

export class TreeGenerator {
	constructor(config) {
		this.canonical = new CanonicalTreeGenerator(config);
	}

	generate(options = {}) {
		return legacyGeometry(this.canonical.generate(options));
	}

	generateSkeleton() {
		return this.canonical.generateSkeleton();
	}

	generateLODs(options = {}) {
		return this.canonical.generateLODs(options);
	}

	capabilities() {
		return this.canonical.capabilities();
	}
}

export {
	generateTreeLods,
	generateTreeProceduralData,
	generateTreeSkeleton
};
export default TreeGenerator;

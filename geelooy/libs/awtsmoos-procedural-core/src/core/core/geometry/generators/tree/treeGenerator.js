
// B"H
import { TreeRNG } from './rng.js';
import { TreeGeometryBuilder } from './treeGeometryBuilder.js';
import { TreeGrowthSystem } from './treeGrowthSystem.js';

export class TreeGenerator {
    constructor(config) {
        this.config = config;
        this.rng = new TreeRNG(config.seed);
        this.builder = new TreeGeometryBuilder();
        this.system = new TreeGrowthSystem(config, this.rng, this.builder);
    }

    generate() {
        this.system.generate();
        return {
            branches: {
                verts: this.builder.verts,
                normals: this.builder.normals,
                uvs: this.builder.uvs,
                indices: this.builder.indices
            },
            leaves: {
                verts: this.builder.leafVerts,
                normals: this.builder.leafNorms,
                uvs: this.builder.leafUVs,
                indices: this.builder.leafIndices,
                colors: this.builder.leafColors
            }
        };
    }
}

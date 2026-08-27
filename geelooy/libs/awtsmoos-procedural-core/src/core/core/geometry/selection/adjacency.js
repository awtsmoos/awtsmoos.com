
// B"H
/**
 * @file adjacency.js
 * @brief The Weaver of Connections. Builds a map of vertex relationships.
 * 
 * THE TOME OF THE NEIGHBOR:
 * No point exists alone in the grand design,
 * Each spark is connected by an invisible line.
 * This Scribe walks the edges where the faces all meet,
 * Recording the pathways, both bitter and sweet.
 * From this map of the local, a new power will grow,
 * To walk through the mesh, and let the selection flow.
 */
import { VertexWelder } from '../utils/vertexWelder.js';

export class MeshAdjacency {
    /**
     * @param {object} mesh The structured mesh data.
     */
    constructor(mesh) {
        this.mesh = mesh;
        this.adjacencyMap = new Map(); // Map<string, Set<string>> hash -> neighbor hashes
        this.weldedMap = null;
        this._build();
    }

    _build() {
        if (!this.mesh || !this.mesh.faces) return;

        this.weldedMap = VertexWelder.getWeldedMap(this.mesh);

        this.mesh.faces.forEach(face => {
            for (let i = 0; i < face.vertices.length; i++) {
                const v1 = face.vertices[i];
                const v2 = face.vertices[(i + 1) % face.vertices.length];
                
                const h1 = VertexWelder.getPositionHash(v1.pos);
                const h2 = VertexWelder.getPositionHash(v2.pos);

                if (!this.adjacencyMap.has(h1)) this.adjacencyMap.set(h1, new Set());
                if (!this.adjacencyMap.has(h2)) this.adjacencyMap.set(h2, new Set());

                this.adjacencyMap.get(h1).add(h2);
                this.adjacencyMap.get(h2).add(h1);
            }
        });
    }

    /**
     * B"H - Retrieves the hashes of all vertices connected to the given vertex.
     * @param {object} vertex A vertex object.
     * @returns {Set<string>} A set of neighbor hashes.
     */
    getNeighborHashes(vertex) {
        const hash = VertexWelder.getPositionHash(vertex.pos);
        return this.adjacencyMap.get(hash) || new Set();
    }

    /**
     * B"H - Finds a representative vertex object for a given position hash.
     * @param {string} hash The position hash.
     * @returns {object|null} The vertex object or null if not found.
     */
    getVertexByHash(hash) {
        if (!this.weldedMap) return null;
        const group = this.weldedMap.get(hash);
        return group ? Array.from(group)[0] : null;
    }
}

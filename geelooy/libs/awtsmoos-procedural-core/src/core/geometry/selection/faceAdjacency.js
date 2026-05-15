
// B"H
/**
 * @file faceAdjacency.js
 * @brief The Weaver of Face Topology. Builds a map of connected faces.
 * 
 * THE POEM OF THE SHARED BORDER:
 * A face alone is but a floating scale,
 * But bound together, they form a cosmic whale.
 * To find the faces that are truly linked,
 * We hash the edges where their vertices are synced.
 * When two faces share a line of code,
 * They walk together on the topological road!
 */

import { VertexWelder } from '../utils/vertexWelder.js';

export class FaceAdjacency {
    /**
     * @param {object} mesh The structured mesh.
     */
    constructor(mesh) {
        this.mesh = mesh;
        // Maps Face Index -> Set of Adjacent Face Indices
        this.adjacentFaces = new Map(); 
        this._build();
    }

    _build() {
        if (!this.mesh || !this.mesh.faces) return;

        // Maps Edge Hash -> Array of Face Indices
        const edgeToFaces = new Map();

        this.mesh.faces.forEach((face, fIdx) => {
            const v = face.vertices;
            const len = v.length;
            for (let i = 0; i < len; i++) {
                const h1 = VertexWelder.getPositionHash(v[i].pos);
                const h2 = VertexWelder.getPositionHash(v[(i + 1) % len].pos);
                
                // Sort to ensure direction-agnostic edge identity
                const key = h1 < h2 ? `${h1}_${h2}` : `${h2}_${h1}`;
                
                if (!edgeToFaces.has(key)) edgeToFaces.set(key, []);
                edgeToFaces.get(key).push(fIdx);
            }
        });

        // Resolve face adjacency
        this.mesh.faces.forEach((_, fIdx) => this.adjacentFaces.set(fIdx, new Set()));

        edgeToFaces.forEach(faceIndices => {
            // If an edge is shared by multiple faces, they are adjacent
            if (faceIndices.length > 1) {
                for (let i = 0; i < faceIndices.length; i++) {
                    for (let j = i + 1; j < faceIndices.length; j++) {
                        this.adjacentFaces.get(faceIndices[i]).add(faceIndices[j]);
                        this.adjacentFaces.get(faceIndices[j]).add(faceIndices[i]);
                    }
                }
            }
        });
    }

    /**
     * Retrieves indices of adjacent faces.
     * @param {number} faceIndex 
     * @returns {Set<number>}
     */
    getAdjacent(faceIndex) {
        return this.adjacentFaces.get(faceIndex) || new Set();
    }
}

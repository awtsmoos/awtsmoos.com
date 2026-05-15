
// B"H
/**
 * @file vertexWelder.js
 * @brief Unifies disparate vertex objects by their physical coordinates.
 * 
 * THE PSALM OF THE WELDED POINT:
 * Though the JSON may speak of many points, the coordinate is but One.
 * We hash the numbers of the void until the welding is done.
 * When a region is chosen to rise, all twins must rise as well,
 * To keep the skin of the creation from becoming a broken shell.
 */

export class VertexWelder {
    /**
     * @brief Maps physical positions to sets of vertex objects inhabiting them.
     * @param {object} mesh The mesh whose vertices are to be unified.
     * @returns {Map<string, Set<object>>} A Map where keys are position-hashes.
     */
    static getWeldedMap(mesh) {
        const weldedMap = new Map();
        if (!mesh || !mesh.faces) return weldedMap;

        mesh.faces.forEach(face => {
            face.vertices.forEach(v => {
                const key = this.getPositionHash(v.pos);
                if (!weldedMap.has(key)) {
                    weldedMap.set(key, new Set());
                }
                weldedMap.get(key).add(v);
            });
        });
        return weldedMap;
    }

    /**
     * @brief Creates a deterministic string key for a 3D position.
     * @param {Array<number>} pos [x, y, z]
     */
    static getPositionHash(pos) {
        // Precision quantization to nullify floating point noise.
        const p = 10000;
        return `${Math.round(pos[0] * p)}|${Math.round(pos[1] * p)}|${Math.round(pos[2] * p)}`;
    }

    /**
     * @brief Finds all vertex objects in the entire mesh that share positions with a specific set.
     * @param {object} mesh 
     * @param {Set<object>} sourceVertices 
     */
    static getRegionalVertexGroups(mesh, sourceVertices) {
        const weldedMap = this.getWeldedMap(mesh);
        const groups = [];
        const processedHashes = new Set();

        sourceVertices.forEach(v => {
            const hash = this.getPositionHash(v.pos);
            if (!processedHashes.has(hash)) {
                const group = weldedMap.get(hash);
                if (group) {
                    groups.push(Array.from(group));
                    processedHashes.add(hash);
                }
            }
        });
        return groups;
    }
}

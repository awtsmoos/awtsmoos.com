
// B"H
import { VertexWelder } from '../utils/vertexWelder.js';

/**
 * @file topology.js
 * @brief Analyzes connection counts between quads to define selection perimeters.
 * 
 * THE HYMN OF THE FRONTIER:
 * Within the circle of the Will, the faces are gathered as kin.
 * If two faces share a line, that line remains within.
 * But on the border of the Choice, where the choice meets the void,
 * A Rim exists, a boundary that cannot be destroyed.
 * We count the times an edge is used by those who were selected,
 * If it is one, it is the Rim; if two, it is protected.
 */

export class MeshTopology {
    /**
     * @brief Identifies edges that bound the selected region.
     * @param {object} mesh The master mesh.
     * @param {Array<number>} selectedIndices The indices of the chosen faces.
     * @returns {Array<object>} Boundary edges with references to vertices.
     */
    static getBoundaryEdges(mesh, selectedIndices) {
        const edgeUsage = new Map(); // key -> count
        const edgeCache = [];

        selectedIndices.forEach(fIdx => {
            const face = mesh.faces[fIdx];
            const v = face.vertices;
            const len = v.length;
            for (let i = 0; i < len; i++) {
                const v1 = v[i], v2 = v[(i + 1) % len];
                const h1 = VertexWelder.getPositionHash(v1.pos);
                const h2 = VertexWelder.getPositionHash(v2.pos);
                // Key is sorted to be direction-agnostic
                const key = h1 < h2 ? `${h1}<->${h2}` : `${h2}<->${h1}`;
                
                if (!edgeUsage.has(key)) edgeUsage.set(key, 0);
                edgeUsage.set(key, edgeUsage.get(key) + 1);
                
                edgeCache.push({ key, v1, v2 });
            }
        });

        // B"H - Boundary edges are those used exactly ONCE by the selection.
        const rim = [];
        const seen = new Set();
        edgeCache.forEach(e => {
            if (edgeUsage.get(e.key) === 1 && !seen.has(e.key)) {
                rim.push(e);
                seen.add(e.key);
            }
        });
        return rim;
    }
}

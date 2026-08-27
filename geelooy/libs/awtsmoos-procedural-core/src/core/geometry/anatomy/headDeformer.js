
// B"H
/**
 * @file headDeformer.js
 * @brief Sculpts the basic head shape by iterating UV sphere rings.
 */
import { HEAD_BANDS } from './headConstants.js';

export function deformHeadBands(mesh) {
    const visited = new Set();
    
    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            if (visited.has(v)) return;
            visited.add(v);

            const ring = v.ringIdx;
            let band = null;

            // Find which band this vertex belongs to
            for (const key in HEAD_BANDS) {
                const b = HEAD_BANDS[key];
                if (b.ring === ring || (ring >= b.start && ring <= b.end)) {
                    band = b; break;
                }
            }

            if (band) {
                // 1. Proportional Scaling (XZ only to preserve height)
                if (band.scale) {
                    v.pos[0] *= band.scale[0];
                    v.pos[2] *= band.scale[2];
                }
                // 2. Proportional Movement (Y/Z protrusion)
                if (band.move) {
                    v.pos[0] += band.move[0];
                    v.pos[1] += band.move[1];
                    v.pos[2] += band.move[2];
                }
            }
        });
    });
    return mesh;
}

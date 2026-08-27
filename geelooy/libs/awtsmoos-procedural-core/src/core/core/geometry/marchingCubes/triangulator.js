// B"H
/**
 * @file triangulator.js
 * @brief Assembles vertices into triangles using analytical normal calculations, revealed by the light of the Awtsmoos.
 */
import { getFieldNormal } from './utils.js';

/**
 * Generates triangle data for a single grid cell.
 * @param {Array} triTable - The row from the triangle lookup table.
 * @param {Array} vertList - The 12 potential vertices for this cell.
 * @param {Array} metaballs - The physics drivers for normal calculation.
 * @param {object} out - Accumulator for mesh data.
 */
export function generateCellTriangles(triTable, vertList, metaballs, out) {
    // B"H - TriTable has up to 15 meaningful entries (5 triangles), terminated by -1.
    for (let i = 0; i < 16; i += 3) {
        if (triTable[i] === -1) break;

        const i1 = triTable[i];
        const i2 = triTable[i + 1];
        const i3 = triTable[i + 2];

        // B"H - Check index validity before access to ensure structural integrity
        if (i1 === undefined || i2 === undefined || i3 === undefined) break;

        const v1 = vertList[i1];
        const v2 = vertList[i2];
        const v3 = vertList[i3];

        // B"H - Ensure no missing vertices for this specific triangle configuration.
        if (!v1 || !v2 || !v3) continue;

        // B"H - Manifest triangle soup: Every tri gets its own unique vertices.
        // This is necessary for accurate analytical normal calculation per vertex.
        const tri = [v1, v2, v3];
        for (let j = 0; j < 3; j++) {
            const pos = tri[j];
            out.positions.push(pos[0], pos[1], pos[2]);
            
            // B"H - Calculate normals precisely at the interpolated vertex position.
            const normal = getFieldNormal(pos, metaballs);
            out.normals.push(normal[0], normal[1], normal[2]);
            
            // Flat indexing for triangle soup: each index matches the sequential vertex count.
            out.indices.push(out.vertexCounter++);
        }
    }
}

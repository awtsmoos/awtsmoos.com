// B"H
/**
 * @file marchingCubes.js
 * @brief Manifests surfaces from scalar fields, corrected for 3D coordinate multipliers.
 */
import { LOOKUP_EDGE_TABLE } from './marchingCubesEdgeTable.js';
import { LOOKUP_TRI_TABLE } from './marchingCubesTriTable.js';
import { vertexInterp } from './marchingCubes/utils.js';
import { generateCellTriangles } from './marchingCubes/triangulator.js';

export class MarchingCubes {
    generateMesh(gridValues, res, size, isoLevel, metaballs, center = [0, 0, 0]) {
        const out = { positions: [], normals: [], indices: [], vertexCounter: 0 };
        const halfSize = size / 2.0;
        const cellSize = size / (res - 1);

        const corners = new Array(8).fill(0).map(() => [0,0,0]);
        const vertList = new Array(12);

        // B"H - Multipliers for grid indexing: X: 1, Y: res, Z: res*res
        const YM = res;
        const ZM = res * res;

        for (let z = 0; z < res - 1; z++) {
            const pz = z * cellSize - halfSize + center[2];
            const zIdx = z * ZM;
            for (let y = 0; y < res - 1; y++) {
                const py = y * cellSize - halfSize + center[1];
                const yIdx = y * YM;
                for (let x = 0; x < res - 1; x++) {
                    const px = x * cellSize - halfSize + center[0];
                    const vIdx = x + yIdx + zIdx;

                    // B"H - Sacred Corner Map: 0-7 following standard MC layout
                    const vals = [
                        gridValues[vIdx],           // 0: (x,y,z)
                        gridValues[vIdx+1],         // 1: (x+1,y,z)
                        gridValues[vIdx+1+ZM],      // 2: (x+1,y,z+1) <- CORRECTED
                        gridValues[vIdx+ZM],        // 3: (x,y,z+1)
                        gridValues[vIdx+YM],        // 4: (x,y+1,z)
                        gridValues[vIdx+YM+1],      // 5: (x+1,y+1,z)
                        gridValues[vIdx+ZM+YM+1],   // 6: (x+1,y+1,z+1)
                        gridValues[vIdx+ZM+YM]      // 7: (x,y+1,z+1)
                    ];

                    let cubeIndex = 0;
                    for (let i = 0; i < 8; i++) if (vals[i] >= isoLevel) cubeIndex |= (1 << i);
                    
                    if (cubeIndex === 0 || cubeIndex === 255) continue;

                    const edges = LOOKUP_EDGE_TABLE[cubeIndex];
                    const triTable = LOOKUP_TRI_TABLE[cubeIndex];
                    
                    corners[0][0]=px; corners[0][1]=py; corners[0][2]=pz;
                    corners[1][0]=px+cellSize; corners[1][1]=py; corners[1][2]=pz;
                    corners[2][0]=px+cellSize; corners[2][1]=py; corners[2][2]=pz+cellSize;
                    corners[3][0]=px; corners[3][1]=py; corners[3][2]=pz+cellSize;
                    corners[4][0]=px; corners[4][1]=py+cellSize; corners[4][2]=pz;
                    corners[5][0]=px+cellSize; corners[5][1]=py+cellSize; corners[5][2]=pz;
                    corners[6][0]=px+cellSize; corners[6][1]=py+cellSize; corners[6][2]=pz+cellSize;
                    corners[7][0]=px; corners[7][1]=py+cellSize; corners[7][2]=pz+cellSize;

                    for (let i = 0; i < 12; i++) {
                        if ((edges >> i) & 1) {
                            const i1 = [0,1,2,3,4,5,6,7,0,1,2,3][i];
                            const i2 = [1,2,3,0,5,6,7,4,4,5,6,7][i];
                            vertList[i] = vertexInterp(isoLevel, corners[i1], corners[i2], vals[i1], vals[i2]);
                        }
                    }
                    generateCellTriangles(triTable, vertList, metaballs, out);
                }
            }
        }
        return out;
    }
}

// B"H
/**
 * @file exportBounds.js
 * @brief Finds the mathematical extreme or center of a mesh region and exports it for dynamic attachment.
 */

export function exportBoundsModifier(mesh, params, objectData) {
    if (!mesh.faces || !params.tag || !params.pointName) return mesh;
    
    let bestV = null;
    let bestVal = params.direction > 0 ? -Infinity : Infinity;
    
    let axisIdx = 1; 
    if (params.axis === 'x') axisIdx = 0;
    if (params.axis === 'z') axisIdx = 2;

    const visited = new Set();
    
    mesh.faces.forEach(face => {
        if (face.tags && face.tags.includes(params.tag)) {
            face.vertices.forEach(v => {
                if (!visited.has(v)) {
                    visited.add(v);
                    const val = v.pos[axisIdx];
                    
                    if (params.direction > 0 && val > bestVal) {
                        bestVal = val;
                        bestV = v.pos;
                    } else if (params.direction < 0 && val < bestVal) {
                        bestVal = val;
                        bestV = v.pos;
                    }
                }
            });
        }
    });

    if (bestV) {
        if (!objectData.exportedPoints) objectData.exportedPoints = {};
        objectData.exportedPoints[params.pointName] = [...bestV];
        console.log(`B"H - EXPORT BOUNDS[${objectData.id}]: Point '${params.pointName}' found at [${bestV[0].toFixed(3)}, ${bestV[1].toFixed(3)}, ${bestV[2].toFixed(3)}]`);
    }

    return mesh;
}

export function exportCentroidModifier(mesh, params, objectData) {
    if (!mesh.faces || !params.tag || !params.pointName) return mesh;
    
    let sum = [0, 0, 0];
    let count = 0;
    const visited = new Set();
    
    mesh.faces.forEach(face => {
        if (face.tags && face.tags.includes(params.tag)) {
            face.vertices.forEach(v => {
                if (!visited.has(v)) {
                    visited.add(v);
                    sum[0] += v.pos[0];
                    sum[1] += v.pos[1];
                    sum[2] += v.pos[2];
                    count++;
                }
            });
        }
    });

    if (count > 0) {
        if (!objectData.exportedPoints) objectData.exportedPoints = {};
        const centroid = [sum[0] / count, sum[1] / count, sum[2] / count];
        objectData.exportedPoints[params.pointName] = centroid;
        console.log(`B"H - EXPORT CENTROID [${objectData.id}]: Point '${params.pointName}' found at [${centroid[0].toFixed(3)}, ${centroid[1].toFixed(3)}, ${centroid[2].toFixed(3)}]`);
    }

    return mesh;
}

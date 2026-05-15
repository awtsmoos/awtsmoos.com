
//B"H
import { CSG } from '../../geometry/csg/index.js';
import { createCubeMesh } from '../../geometry/primitives/cube.js';
import { meshToRenderData } from '../../geometry/utils/meshData.js';

/**
 * @file box.js
 * @brief Provides functions to generate the box-like geometry for the Ark's body.
 *        Refined to preserve QUAD topology throughout the CSG process.
 */

/**
 * Helper to apply scale to a Structured Mesh's vertices directly.
 */
function scaleStructuredMesh(mesh, dims) {
    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            v.pos[0] *= dims[0];
            v.pos[1] *= dims[1];
            v.pos[2] *= dims[2];
        });
    });
    return mesh;
}

function translateStructuredMesh(mesh, offset) {
    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            v.pos[0] += offset[0];
            v.pos[1] += offset[1];
            v.pos[2] += offset[2];
        });
    });
    return mesh;
}

/**
 * B"H - Creates the hollow, layered boxes for the Ark body using Quad-Preserving CSG.
 */
export function createHollowBox(dims, material, id, thickness) {
    // 1. Create Shell (Structured Faces, Quads)
    const shellMesh = createCubeMesh({ size: 1.0 });
    scaleStructuredMesh(shellMesh, dims);

    // 2. Create Cutter (Structured Faces, Quads)
    const cutterMesh = createCubeMesh({ size: 1.0 });
    
    // Calculate inner dimensions
    const innerDims = [
        dims[0] - thickness * 2,
        dims[1], // Height isn't reduced initially, we translate
        dims[2] - thickness * 2
    ];
    
    scaleStructuredMesh(cutterMesh, innerDims);
    translateStructuredMesh(cutterMesh, [0, thickness, 0]); // Move up to cut the top

    // 3. Perform CSG
    // CSG.fromMesh now handles Structured Meshes via meshToPolygons
    const csgShell = CSG.fromMesh(shellMesh);
    const csgCutter = CSG.fromMesh(cutterMesh);
    
    // 4. Subtract and Convert back to Structured Mesh
    const finalStructuredMesh = csgShell.subtract(csgCutter).toMesh(); // polygonsToMesh returns { faces: ... }

    // 5. Apply Color
    finalStructuredMesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            v.col = [1, 1, 1, 1];
        });
    });

    // 6. Convert to Render Data (Generates Quad Wireframes)
    const finalRenderData = meshToRenderData(finalStructuredMesh);

    return {
        id: id,
        primitive: 'none',
        ...finalRenderData,
        shaderVars: material,
        children: []
    };
}

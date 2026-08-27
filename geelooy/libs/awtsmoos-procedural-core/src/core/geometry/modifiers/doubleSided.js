// B"H
import { Vec3 } from '../../math/vec3.js';

/**
 * @brief Creates back-faces for a mesh, making it "double-sided" for physics.
 *        It iterates existing faces and adds new faces with reversed vertex order.
 *        This ensures normals point outwards from both sides of the surface.
 * @param {object} mesh - The input mesh with a `faces` array.
 * @returns {object} The modified mesh with double the number of faces.
 */
export function makeDoubleSidedModifier(mesh) {
    // We iterate the existing faces and append reversed copies.
    // To avoid an infinite loop, we must only iterate over the original set of faces.
    const originalFacesCount = mesh.faces.length;
    
    for (let i = 0; i < originalFacesCount; i++) {
        const face = mesh.faces[i];
        
        // Create a new array for the reversed vertices of the back-face.
        const reversedVerts = [];
        
        // Iterate backwards through the vertices of the original face.
        for (let j = face.vertices.length - 1; j >= 0; j--) {
            const v = face.vertices[j];
            
            // Deep clone the vertex data to ensure the new face is independent.
            // The position is shared, creating a zero-thickness, two-sided surface.
            const newV = {
                pos: [...v.pos], 
                col: v.col ? [...v.col] : [1,1,1,1],
                // The normal will be recalculated by meshToRenderData based on the new
                // winding order, so we don't need to flip it here. If smooth normals
                // were in use, we would flip them.
                norm: v.norm ? Vec3.scale(v.norm, -1.0) : undefined
            };
            reversedVerts.push(newV);
        }
        
        // Add the new back-face to the mesh's face list.
        mesh.faces.push({ vertices: reversedVerts });
    }
    
    return mesh;
}
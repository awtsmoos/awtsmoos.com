// B"H
/**
 * @brief Deletes a face from the mesh.
 *        Note: This changes the indices of subsequent faces!
 *        It is recommended to use this as the LAST step or careful indexing.
 *        However, for the scene parser, we might just mark it as null/empty 
 *        if we wanted to preserve indices, but `meshToRenderData` handles arrays.
 *        We'll splice it out.
 */
export function deleteFaceModifier(mesh, faceIndex) {
    if (faceIndex < 0 || faceIndex >= mesh.faces.length) return mesh;
    
    // Remove the face
    mesh.faces.splice(faceIndex, 1);
    
    return mesh;
}
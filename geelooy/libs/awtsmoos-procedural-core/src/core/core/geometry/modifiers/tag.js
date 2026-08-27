
// B"H
/**
 * @file tag.js
 * @brief Embeds a sacred name (tag) into the faces of a geometry. 
 *        This allows later modifiers to instantly select these faces regardless of how the index arrays have shifted.
 */
import { queryFaces } from '../selection/faceQuery.js';

export function tagFacesModifier(mesh, params) {
    if (!params || !params.tag) return mesh;
    
    const indices = queryFaces(mesh, params.query);
    
    indices.forEach(idx => {
        const face = mesh.faces[idx];
        if (face) {
            if (!face.tags) face.tags = [];
            if (!face.tags.includes(params.tag)) {
                face.tags.push(params.tag);
            }
        }
    });
    
    return mesh;
}

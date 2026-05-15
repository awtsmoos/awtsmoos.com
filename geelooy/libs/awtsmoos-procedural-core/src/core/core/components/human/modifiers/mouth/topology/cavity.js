
// B"H
/**
 * @file cavity.js
 * @brief Carves the infinite space inside the Golem's mouth through pure Constructive Solid Geometry.
 * 
 * THE PSALM OF THE TRUE VOID:
 * We do not merely push the faces in, a shallow, hollow trick!
 * We summon forth a cutter block, mathematically thick.
 * It strikes the face, it carves the bone, a Boolean decree,
 * And where it passes, emptiness becomes the inner sea!
 * We tag the darkness left behind, the walls of the inside,
 * Then ask the query engine where the outer borders hide.
 * The lips emerge as boundary lines, the seam of dark and light,
 * Prepared to shape the phonemes that will banish endless night!
 */

export const MOUTH_CAVITY_MODS = [
    // 1. B"H - THE CSG CUT
    // Manifest a box and thrust it into the lower face to carve the oral cavity.
    // The newly exposed inner faces will be branded with 'mouth_inner'.
    {
        type: 'csgPrimitiveSubtract',
        params: {
            primitive: 'cube',
            parameters: { size: 1.0 },
            transform: {
                scale: [0.75, 0.25, 1.2], // Width, Height, Depth
                position: [0, 2.75, 1.0]  // Pushed deep into the face
            },
            insideTag: 'mouth_inner'
        }
    },

    // 2. B"H - THE TIKKUN OF THE LIPS (Topological Query)
    // We must find the outer skin that touches the hole.
    // We select the faces that are adjacent to 'mouth_inner' (by growing it 1 step)
    // but we EXCLUDE the actual 'mouth_inner' faces themselves!
    {
        type: 'tagFaces',
        params: {
            tag: 'lip_rim',
            query: {
                and: [
                    { grow: { fromQuery: { tag: 'mouth_inner' }, steps: 1 } },
                    { inverse: { tag: 'mouth_inner' } }
                ]
            }
        }
    },

    // 3. Export the centroid of the opening so the tongue and teeth can spawn correctly
    { 
        type: 'exportCentroid', 
        params: { tag: 'lip_rim', pointName: 'mouth_opening_center' } 
    }
];
  
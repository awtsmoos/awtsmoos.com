
// B"H
/**
 * @file cavity.js
 * @brief Carves the infinite space inside the Golem's mouth through pure topological inversion.
 * 
 * THE PSALM OF THE INWARD BREATH:
 * We do not smash a block into the face of the creation!
 * That is the way of chaos and fractured normals.
 * Instead, we select the lips, and we draw them inwards,
 * extruding the void itself into the heart of the vessel.
 * Through negative distance, the faces fold inside-out,
 * creating a perfect, unbroken cavity for the breath of life!
 */

export const MOUTH_CAVITY_MODS = [
    // 1. Tag the precise faces on the front of the spherized head where the mouth belongs.
    // B"H - Y bounds elevated (2.9 to 3.3) to match the raised head center!
    {
        type: 'tagFaces',
        params: {
            tag: 'lip_rim_initial',
            query: { box: { min: [-0.35, 2.9, 1.1], max: [0.35, 3.3, 1.6] } }
        }
    },

    // 2. B"H - THE TIKKUN OF THE PRESERVED BREATH:
    // Export the centroid NOW, before inward folding deletes the tags!
    { 
        type: 'exportCentroid', 
        params: { tag: 'lip_rim_initial', pointName: 'mouth_opening_center' } 
    },

    // 3. Perform a negative extrusion to push the faces INSIDE the head!
    {
        type: 'extrudeFaces',
        params: {
            query: { tag: 'lip_rim_initial' },
            distance: -0.2, // PUSH INWARD
            steps: 2,
            scale: 0.9,
            assignSideTag: 'mouth_inner_walls',
            assignCapTag: 'throat_start',
            clearTags: true // The initial tag is erased to prevent duplicates on the throat wall
        }
    },

    // 4. Extrude deeper to form the back of the throat.
    {
        type: 'extrudeFaces',
        params: {
            query: { tag: 'throat_start' },
            distance: -0.5, 
            scale: 0.7, 
            assignSideTag: 'mouth_inner_walls',
            assignCapTag: 'mouth_inner_back',
            clearTags: true
        }
    },

    // 5. Unify the inner tags for coloring and selection.
    { type: 'tagFaces', params: { tag: 'mouth_inner', query: { tag: 'mouth_inner_walls' } } },
    { type: 'tagFaces', params: { tag: 'mouth_inner', query: { tag: 'mouth_inner_back' } } },

    // 6. THE RESURRECTION OF THE RIM: 
    // Re-tag the exact opening using a pure topological boundary query!
    // This allows the Shape Keys to grab the lips for speech!
    {
        type: 'tagFaces',
        params: {
            tag: 'lip_rim',
            query: { boundary: { fromQuery: { tag: 'mouth_inner' } } }
        }
    }
];

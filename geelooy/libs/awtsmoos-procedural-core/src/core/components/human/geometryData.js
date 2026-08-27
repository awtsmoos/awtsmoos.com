
// B"H
/**
 * @file geometryData.js
 * @brief Procedural manifestation of the human flesh through coordinated extrusions.
 * 
 * THE POEM OF THE EXTENSION:
 * We start with the Torso, a vessel of might,
 * Scaling and shifting it into the light.
 * From tags of direction, the limbs begin growth,
 * In perfect accordance with the skeletal oath.
 */

export const HUMAN_GEOMETRY_MODS = [
    // 1. Establish the Main Torso
    // Spans Y from 3.0 to 6.0 to match spine bones
    { type: 'scaleMesh', scale: [1.6, 3.0, 0.8] },
    { type: 'translateMesh', translation: [0, 4.5, 0] },
    { type: 'subdivide', levels: 2 },

    // 2. Identify and Extrude Arms from the upper sides
    { 
        type: 'tagFaces', 
        params: { 
            tag: 'arm_l_root', 
            query: { closestTo: [-0.8, 5.5, 0], normalDot: [-1, 0, 0], count: 2 } 
        } 
    },
    { 
        type: 'tagFaces', 
        params: { 
            tag: 'arm_r_root', 
            query: { closestTo: [0.8, 5.5, 0], normalDot: [1, 0, 0], count: 2 } 
        } 
    },
    { 
        type: 'extrudeFaces', 
        params: { 
            query: { tag: 'arm_l_root' }, distance: 3.2, steps: 6, scale: 0.7, assignCapTag: 'hand_l' 
        } 
    },
    { 
        type: 'extrudeFaces', 
        params: { 
            query: { tag: 'arm_r_root' }, distance: 3.2, steps: 6, scale: 0.7, assignCapTag: 'hand_r' 
        } 
    },

    // 3. Identify and Extrude Legs from the bottom
    { 
        type: 'tagFaces', 
        params: { 
            tag: 'leg_l_root', 
            query: { closestTo: [-0.5, 3.0, 0], normalDot: [0, -1, 0], count: 2 } 
        } 
    },
    { 
        type: 'tagFaces', 
        params: { 
            tag: 'leg_r_root', 
            query: { closestTo: [0.5, 3.0, 0], normalDot: [0, -1, 0], count: 2 } 
        } 
    },
    { 
        type: 'extrudeFaces', 
        params: { 
            query: { tag: 'leg_l_root' }, distance: 3.6, steps: 6, scale: 0.7, assignCapTag: 'foot_l' 
        } 
    },
    { 
        type: 'extrudeFaces', 
        params: { 
            query: { tag: 'leg_r_root' }, distance: 3.6, steps: 6, scale: 0.7, assignCapTag: 'foot_r' 
        } 
    },

    // 4. Ritual Purification (Rigging and Normals)
    { type: 'skinning' },
    { type: 'setFaceColor', params: { color: [0.25, 0.25, 0.3, 1.0] } }, // Inner substance
    { 
        type: 'setFaceColor', 
        params: { query: { tag: 'hand_l' }, color: [0.94, 0.76, 0.64, 1.0] } 
    },
    { 
        type: 'setFaceColor', 
        params: { query: { tag: 'hand_r' }, color: [0.94, 0.76, 0.64, 1.0] } 
    },
    { type: 'smoothNormals' }
];

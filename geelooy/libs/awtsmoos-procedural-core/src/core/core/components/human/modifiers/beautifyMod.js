
// B"H
/**
 * @file beautifyMod.js
 * @brief Polishes the vessel for final manifestation.
 * 
 * POEM OF THE GARMENT:
 * The body is grey like the clay of the ground,
 * But the skin of the extremities is easily found.
 * We bathe them in hues of the spirit and bone,
 * Making the unity of the parts clearly known.
 * From hand unto head, the same color we trace,
 * To grant the Golem a human-like face.
 */

export const BEAUTIFY_MODS =[
    // 1. Calculate Skeletal Bindings
    { type: 'skinning' },
    
    // 2. Global Base Color
    { type: 'setFaceColor', params: { color:[0.22, 0.22, 0.28, 1.0] } }, 
    
    // 3. Highlight specialized regions (Skin Tones)
    // B"H - Utilizing the unified head tag from the Adaptive Spherize miracle
    { type: 'setFaceColor', params: { query: { tag: 'head_all' }, color:[0.94, 0.76, 0.64, 1.0] } },
    { type: 'setFaceColor', params: { query: { tag: 'head_base' }, color:[0.94, 0.76, 0.64, 1.0] } },
    { type: 'setFaceColor', params: { query: { tag: 'neck_walls' }, color:[0.94, 0.76, 0.64, 1.0] } },
    { type: 'setFaceColor', params: { query: { tag: 'neck_root' }, color:[0.94, 0.76, 0.64, 1.0] } },
    
    { type: 'setFaceColor', params: { query: { tag: 'hand_l' }, color:[0.94, 0.76, 0.64, 1.0] } },
    { type: 'setFaceColor', params: { query: { tag: 'hand_r' }, color:[0.94, 0.76, 0.64, 1.0] } },
    { type: 'setFaceColor', params: { query: { tag: 'arm_l_side' }, color:[0.22, 0.22, 0.28, 1.0] } },
    { type: 'setFaceColor', params: { query: { tag: 'arm_r_side' }, color:[0.22, 0.22, 0.28, 1.0] } },
    
    { type: 'setFaceColor', params: { query: { tag: 'foot_l' }, color:[0.4, 0.3, 0.25, 1.0] } },
    { type: 'setFaceColor', params: { query: { tag: 'foot_r' }, color:[0.4, 0.3, 0.25, 1.0] } },
    { type: 'setFaceColor', params: { query: { tag: 'leg_l_side' }, color:[0.2, 0.25, 0.3, 1.0] } }, // Pants
    { type: 'setFaceColor', params: { query: { tag: 'leg_r_side' }, color:[0.2, 0.25, 0.3, 1.0] } },
    
    // 4. Color the internal void carved by the CSG subtract
    { type: 'setFaceColor', params: { query: { tag: 'mouth_inner' }, color:[0.3, 0.05, 0.05, 1.0] } },
    
    // 5. Harmonize boundaries to create smooth, organic lighting
    { type: 'smoothNormals' }
];

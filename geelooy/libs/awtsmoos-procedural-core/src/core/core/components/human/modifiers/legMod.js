
// B"H
/**
 * @file legMod.js
 * @brief Logic for manifesting the segmented stance of the Golem.
 * 
 * THE HYMN OF THE FOUNDATIONAL PILLARS:
 * From the hips of the torso, the legs descend,
 * Thighs taper to the knees where the structure bends.
 * Calves reach down to the ankles below,
 * And the feet thrust forward, ready to go.
 * 
 * @module legModifiers
 * @exports {Array} LEG_MODS - The extrusion operations for leg manifestation
 */

export const LEG_MODS = [
  // --- LEFT LEG ---
  // 1. Thigh to Knee
  {
    type: 'extrudeFaces',
    params: { query: { tag: 'leg_l_root' }, distance: 2.0, steps: 4, scale: 0.8, assignCapTag: 'knee_l', clearTags: true }
  },
  // 2. Calf to Ankle
  {
    type: 'extrudeFaces',
    params: { query: { tag: 'knee_l' }, distance: 1.8, steps: 3, scale: 0.8, assignCapTag: 'ankle_l', clearTags: true }
  },
  // 3. Foot (Extrude down slightly, scale heavily in Z to create length, and flatten Y)
  {
    type: 'extrudeFaces',
    params: { query: { tag: 'ankle_l' }, distance: 0.4, steps: 2, scale: [1.1, 1.0, 2.5], assignCapTag: 'foot_l', clearTags: true }
  },
  // Shift the foot forward so it looks like a shoe and not a peg
  { type: 'translateFace', params: { face: { tag: 'foot_l' }, direction: [0, 0, 1], amount: 0.4 } },

  // --- RIGHT LEG ---
  // 1. Thigh to Knee
  {
    type: 'extrudeFaces',
    params: { query: { tag: 'leg_r_root' }, distance: 2.0, steps: 4, scale: 0.8, assignCapTag: 'knee_r', clearTags: true }
  },
  // 2. Calf to Ankle
  {
    type: 'extrudeFaces',
    params: { query: { tag: 'knee_r' }, distance: 1.8, steps: 3, scale: 0.8, assignCapTag: 'ankle_r', clearTags: true }
  },
  // 3. Foot
  {
    type: 'extrudeFaces',
    params: { query: { tag: 'ankle_r' }, distance: 0.4, steps: 2, scale: [1.1, 1.0, 2.5], assignCapTag: 'foot_r', clearTags: true }
  },
  // Shift the foot forward
  { type: 'translateFace', params: { face: { tag: 'foot_r' }, direction: [0, 0, 1], amount: 0.4 } }
];
  
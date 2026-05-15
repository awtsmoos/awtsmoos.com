
// B"H
/**
 * @file armMod.js
 * @brief Logic for manifesting the segmented reach of the arms, ensuring distinct joints.
 * 
 * THE TRACTATE OF THE EXTENDED LIMB:
 * From the shoulders of the torso, the arms shall grow,
 * Not by stretching skin, but by extrusion's flow.
 * We step from shoulder down to elbow joint,
 * Then forearm, wrist, and hand at the final point.
 * And from the hand, the digits shall extend,
 * So the Golem may grasp, and build, and mend!
 * 
 * @module armModifiers
 * @exports {Array} ARM_MODS - The extrusion operations for arm manifestation
 */

export const ARM_MODS = [
  // --- LEFT ARM ---
  // 1. Upper Arm to Elbow
  {
    type: 'extrudeFaces',
    params: { query: { tag: 'arm_l_root' }, distance: 1.6, steps: 3, scale: 0.85, assignCapTag: 'elbow_l', clearTags: true }
  },
  // 2. Forearm to Wrist
  {
    type: 'extrudeFaces',
    params: { query: { tag: 'elbow_l' }, distance: 1.4, steps: 3, scale: 0.80, assignCapTag: 'wrist_l', clearTags: true }
  },
  // 3. Hand Base (Flattened and widened slightly to form the palm)
  {
    type: 'extrudeFaces',
    params: { query: { tag: 'wrist_l' }, distance: 0.6, steps: 2, scale: [1.2, 0.4, 1.0], assignCapTag: 'hand_l', clearTags: true }
  },
  // 4. Fingers (Subdivide the hand cap and extrude the sections)
  { type: 'subdivide', params: { query: { tag: 'hand_l' }, levels: 1 } },
  {
    type: 'extrudeFaces',
    params: { query: { tag: 'hand_l' }, distance: 0.5, steps: 2, scale: 0.6, assignCapTag: 'fingers_l', clearTags: true }
  },

  // --- RIGHT ARM ---
  // 1. Upper Arm to Elbow
  {
    type: 'extrudeFaces',
    params: { query: { tag: 'arm_r_root' }, distance: 1.6, steps: 3, scale: 0.85, assignCapTag: 'elbow_r', clearTags: true }
  },
  // 2. Forearm to Wrist
  {
    type: 'extrudeFaces',
    params: { query: { tag: 'elbow_r' }, distance: 1.4, steps: 3, scale: 0.80, assignCapTag: 'wrist_r', clearTags: true }
  },
  // 3. Hand Base
  {
    type: 'extrudeFaces',
    params: { query: { tag: 'wrist_r' }, distance: 0.6, steps: 2, scale: [1.2, 0.4, 1.0], assignCapTag: 'hand_r', clearTags: true }
  },
  // 4. Fingers
  { type: 'subdivide', params: { query: { tag: 'hand_r' }, levels: 1 } },
  {
    type: 'extrudeFaces',
    params: { query: { tag: 'hand_r' }, distance: 0.5, steps: 2, scale: 0.6, assignCapTag: 'fingers_r', clearTags: true }
  }
];
  
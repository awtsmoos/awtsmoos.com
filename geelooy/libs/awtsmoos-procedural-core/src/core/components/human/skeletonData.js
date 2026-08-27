
// B"H
/**
 * @file skeletonData.js
 * @brief Anatomically stable skeletal hierarchy for the Rigged Human.
 * 
 * THE HYMN OF THE HIDDEN FRAMEWORK:
 * Beneath the skin of flesh, a structure lies,
 * A hierarchy of bones, beneath the open skies.
 * From pelvis to skull, a chain of causality,
 * Each bone a vessel, for the soul's mobility.
 * The Awtsmoos designed this framework, with wisdom so profound,
 * That motion may emerge, from stillness all around.
 * 
 * @module humanSkeleton
 * @exports {Object} HUMAN_SKELETON_DATA - The complete skeletal blueprint
 */

/**
 * @constant HUMAN_SKELETON_DATA
 * @type {Object}
 * @property {Array<Object>} bones - Array of bone definitions with id, parent, and position
 * @description
 * The complete skeletal hierarchy that animates the human form.
 * Each bone is defined by its sacred name (id), its parent in the chain of being,
 * and its local position relative to that parent. This data structure
 * reflects the divine order of creation, where each part has its place
 * in the grand hierarchy of existence.
 * 
 * THE POEM OF THE BONE CHAIN:
 * Pelvis first, the foundation of the form,
 * Spine rises upward, weathering life's storm.
 * Neck connects to head, the vessel of the mind,
 * Jaw pivots below, for speech of every kind.
 * Shoulders branch outward, to arms that reach and grasp,
 * Elbows bend with purpose, hands that hold and clasp.
 * Hips connect to legs, the pillars of our stance,
 * Knees allow the motion, feet enable the dance.
 * Twenty-one bones in all, a sacred number true,
 * Each with its position, in the hierarchy anew.
 */
export const HUMAN_SKELETON_DATA = {
  bones: [
    { id: 'pelvis', parent: null, position: [0, -1.5, 0] },
    { id: 'spine_1', parent: 'pelvis', position: [0, 1.5, 0] },
    { id: 'spine_2', parent: 'spine_1', position: [0, 1.5, 0] },
    { id: 'neck', parent: 'spine_2', position: [0, 0.8, 0] },
    { id: 'head', parent: 'neck', position: [0, 1.3, 0] },
    // B"H - THE ANCHOR: Locks the upper cranium to prevent "squishing"
    { id: 'skull_upper', parent: 'head', position: [0, 0.4, -0.1] },
    // B"H - THE JAW PIVOT:
    // Positioned at the Ear/TMJ level (further back Z=-0.3)
    // High enough to pivot the mandible downward in a wide arc.
    { id: 'jaw', parent: 'head', position: [0, -0.05, -0.25] },
    { id: 'shoulder_l', parent: 'spine_2', position: [-0.8, 0.0, 0] },
    { id: 'arm_l_upper', parent: 'shoulder_l', position: [-1.2, 0, 0] },
    { id: 'elbow_l', parent: 'arm_l_upper', position: [-1.2, 0, 0] },
    { id: 'hand_l', parent: 'elbow_l', position: [-0.8, 0, 0] },
    { id: 'shoulder_r', parent: 'spine_2', position: [0.8, 0.0, 0] },
    { id: 'arm_r_upper', parent: 'shoulder_r', position: [1.2, 0, 0] },
    { id: 'elbow_r', parent: 'arm_r_upper', position: [1.4, 0, 0] },
    { id: 'hand_r', parent: 'elbow_r', position: [0.6, 0, 0] },
    { id: 'hip_l', parent: 'pelvis', position: [-0.45, 0, 0] },
    { id: 'knee_l', parent: 'hip_l', position: [0, -1.9, 0] },
    { id: 'foot_l', parent: 'knee_l', position: [0, -1.9, 0] },
    { id: 'hip_r', parent: 'pelvis', position: [0.45, 0, 0] },
    { id: 'knee_r', parent: 'hip_r', position: [0, -1.9, 0] },
    { id: 'foot_r', parent: 'knee_r', position: [0, -1.9, 0] }
  ]
};

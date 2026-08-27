
// B"H
/**
 * @file standardHumanAnimations.js
 * @brief Maps the physical bones of the humanoid to their corresponding animation tracks.
 * 
 * THE CHRONICLE OF THE ANIMATED FORM:
 * The bones are but vessels, awaiting the breath of life,
 * The animation tracks, the divine will, cutting through strife.
 * Each bone mapped to a track, a channel for motion's flow,
 * From idle stillness, to walking, to falling, to the jump's high throw.
 * The Awtsmoos designed this system, with elegance so pure,
 * That any motion may emerge, from data that endures.
 * 
 * @module standardHumanAnimations
 * @exports {Array} STANDARD_HUMAN_ANIMATIONS - The bone-to-track mapping for standard motions
 */

/**
 * @constant STANDARD_HUMAN_ANIMATIONS
 * @type {Array<Object>}
 * @description
 * The sacred mapping between skeletal bones and their animation tracks.
 * Each entry defines which bone (boneId) is animated by which track,
 * allowing the animation manager to layer and blend motions seamlessly.
 * This data-driven approach reflects the divine wisdom of separation:
 * the form is one thing, the motion another, united only by the will.
 * 
 * THE POEM OF THE LAYERED MOTION:
 * Walk tracks for the legs, in alternating grace,
 * Arm tracks for the swing, in rhythmic pace.
 * Idle tracks for breathing, subtle and profound,
 * Fall tracks for the descent, when the feet leave the ground.
 * Jump tracks for the ascent, against gravity's pull,
 * All mapped to their bones, in a system beautiful.
 * Twenty-eight entries in all, a sacred array,
 * Defining the motions, night and day.
 */
export const STANDARD_HUMAN_ANIMATIONS = [
  // --- WALK TRACKS ---
  { boneId: 'hip_l', track: 'walk_hip_l' },
  { boneId: 'knee_l', track: 'walk_knee_l' },
  { boneId: 'hip_r', track: 'walk_hip_r' },
  { boneId: 'knee_r', track: 'walk_knee_r' },
  { boneId: 'shoulder_l', track: 'walk_arm_l' },
  { boneId: 'shoulder_r', track: 'walk_arm_r' },
  { boneId: 'elbow_l', track: 'walk_elbow_l' },
  { boneId: 'elbow_r', track: 'walk_elbow_r' },
  { boneId: 'pelvis', track: 'walk_pelvis' },
  
  // --- IDLE TRACKS (Extended Life) ---
  { boneId: 'hip_l', track: 'idle_legs_l' },
  { boneId: 'knee_l', track: 'idle_knee_l' },
  { boneId: 'hip_r', track: 'idle_legs_r' },
  { boneId: 'knee_r', track: 'idle_knee_r' },
  { boneId: 'shoulder_l', track: 'idle_arm_l' },
  { boneId: 'shoulder_r', track: 'idle_arm_r' },
  { boneId: 'pelvis', track: 'idle_breathing' },
  { boneId: 'spine_1', track: 'idle_spine_1' },
  { boneId: 'spine_2', track: 'idle_spine_2' },
  { boneId: 'neck', track: 'idle_neck' },
  
  // --- FALL TRACKS ---
  { boneId: 'pelvis', track: 'fall_pelvis' },
  { boneId: 'hip_l', track: 'fall_legs' },
  { boneId: 'hip_r', track: 'fall_legs' },
  { boneId: 'knee_l', track: 'fall_knees' },
  { boneId: 'knee_r', track: 'fall_knees' },
  { boneId: 'shoulder_l', track: 'fall_arms' },
  { boneId: 'shoulder_r', track: 'fall_arms' },
  
  // --- JUMP TRACKS ---
  { boneId: 'pelvis', track: 'jump_start_pelvis' },
  { boneId: 'hip_l', track: 'jump_start_legs' },
  { boneId: 'hip_r', track: 'jump_start_legs' },
  { boneId: 'knee_l', track: 'jump_start_knees' },
  { boneId: 'knee_r', track: 'jump_start_knees' }
];

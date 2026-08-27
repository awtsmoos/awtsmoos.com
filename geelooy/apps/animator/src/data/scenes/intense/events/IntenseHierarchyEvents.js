
// B"H
/**
 * @file IntenseHierarchyEvents.js
 * @description
 * 
 * ============================================================================
 * CHAPTER 21: THE CASCADE OF WILL (Hitpashtut HaRatzon)
 * ============================================================================
 * An epic display of Universal Parenting, Physics, and Custom Anime Macros!
 * 
 * Timeline:
 * 0s: Husband mounts the Chair. 
 * 1s: A wild Wagon appears, rolling right!
 * 2s: Wife walks over and grasps the CHAIR.
 *     (Because the Husband is mounted to the Chair, he is lifted too!)
 * 4s: Wife THROWS the Chair onto the moving Wagon.
 *     (The Chair's parent becomes the Wagon. The Husband rides along!)
 * 6s: Husband begins BRUSHING HIS TEETH while soaring on the wagon!
 * 12s: Husband explodes with Anime Rage Aura.
 * ============================================================================
 */

export const IntenseHierarchyEvents = [
  // 0s: Spawn the Chair!
  { type: 'prop', id: 'comfy_chair', propType: 'chair', action: 'spawn', start: 0, end: 24000, x: -250, y: 120, scale: 1.2 },

  // 0s: Husband mounts the Chair prop immediately
  { type: 'interact', action: 'mount', target: 'comfy_chair', actor: 'c1_husband', start: 0, end: 100 },
  
  // 1s: A wild Wagon appears, rolling right
  { type: 'prop', id: 'wagon_1', propType: 'wagon', action: 'spawn', start: 1000, end: 24000, x: -800, y: 120, scale: 1.0, velocity: { x: 4, y: 0 } },

  // 2s: Wife walks over and grasps the CHAIR
  { type: 'character', id: 'c2_wife', start: 1000, end: 2000, pos: { from: {x: 180, y:0}, to: {x: -150, y:0} } },
  { type: 'interact', action: 'pickup', target: 'comfy_chair', actor: 'c2_wife', start: 2000, end: 2100 },

  // 3.5s: Wife winds up to throw
  { type: 'character', id: 'c2_wife', start: 3500, end: 4000, actions: [{ at: 0, key: 'acting', value: 'shrug' }] },

  // 4s: Wife THROWS the Chair (which contains the Husband)
  { type: 'interact', action: 'throw', target: 'comfy_chair', actor: 'c2_wife', start: 4000, end: 4100 },

  // 6s: B"H - CUSTOM MACRO INJECTION: Brush Teeth!
  // This spawns a toothbrush, attaches it to the wrist, and triggers wild IK arm waving natively!
  // It happens while he is already parented to the flying chair!
  { type: 'custom_macro', script: 'brush_teeth', actor: 'c1_husband', start: 6000, end: 11000 },
  
  // 12.5s: B"H - CUSTOM MACRO INJECTION: Anime Rage Aura!
  // Injects massive jagged flame polygons behind him and forces his hair gravity to float!
  { type: 'custom_macro', script: 'anime_rage', actor: 'c1_husband', start: 12500, end: 20000 },

  // Background Portal Painting appears to prove recursive rendering
  { type: 'prop', id: 'portal_1', propType: 'nested_painting', action: 'spawn', start: 0, end: 24000, x: 300, y: -250, scale: 1.0 }
];

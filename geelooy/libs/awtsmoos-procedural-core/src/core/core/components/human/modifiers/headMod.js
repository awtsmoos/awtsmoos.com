
// B"H
/**
 * @file headMod.js
 * @chapter THE CROWN OF WISDOM REFORGED AND LIFTED
 * 
 * He looked down, and so the code was rewritten that he may look up.
 * We extend the neck's reach and thin the vessel of the mind,
 * pushing the center of the adaptive spherize higher into the heavens.
 * 
 * THE PSALM OF THE ASCENDING HEAD:
 * From the neck of the torso, the head shall rise,
 * A vessel of wisdom, beneath the endless skies.
 * We extrude upward, with measured grace,
 * Then spherize the form, to hold the thinking face.
 * The adaptive algorithm, with blending so fine,
 * Creates a perfect head, by the divine design.
 * 
 * @module headModifiers
 * @exports {Array} HEAD_MODS - The operations for head and neck manifestation
 */

/**
 * @constant HEAD_MODS
 * @type {Array<Object>}
 * @description
 * The sacred sequence that manifests the head and neck from the tagged torso.
 * First extruding the neck upward, then the head volume, then applying
 * adaptive spherization to create a noble, proportional cranial form.
 * 
 * THE HYMN OF THE SPHERIZED CROWN:
 * First, the neck extends, by eight-tenths of a unit high,
 * Two steps of extrusion, scaling by sixty-five percent, to comply.
 * Then the head volume, one point eight units more,
 * Three steps, scaled by one point eight, to open wisdom's door.
 * Tag all for spherizing, with a center raised up high,
 * Radius of one point one five, beneath the endless sky.
 * Blend from two point one to two point eight in Y,
 * So the neck connects smoothly, as the head touches the sky.
 */
export const HEAD_MODS = [
  // B"H - THE TIKKUN: Extrusion is now based on a pre-subdivision tag.
  // 1. Extrude the Neck (LIFTED HIGHER)
  {
    type: 'extrudeFaces',
    params: {
      query: { tag: 'neck_root' },
      distance: 0.8, // B"H - Increased from 0.5 to cure the slouch
      steps: 2,
      scale: 0.65,
      assignCapTag: 'head_base_start',
      clearTags: true
    }
  },
  // 2. Extrude the Head Volume (THINNER PROFILE)
  {
    type: 'extrudeFaces',
    params: {
      query: { tag: 'head_base_start' },
      distance: 1.8,
      steps: 3,
      scale: 1.8, // B"H - Reduced from 2.2 for a more proportional, less bulbous head
      assignCapTag: 'head_top_cap',
      assignSideTag: 'head_side_walls',
      clearTags: true
    }
  },
  // 3. Tag for Spherization
  { type: 'tagFaces', params: { tag: 'head_all', query: { tag: 'head_base_start' } } },
  { type: 'tagFaces', params: { tag: 'head_all', query: { tag: 'head_side_walls' } } },
  { type: 'tagFaces', params: { tag: 'head_all', query: { tag: 'head_top_cap' } } },
  // 4. Spherize (HIGHER CENTER, SMALLER RADIUS)
  {
    type: 'adaptiveSpherize',
    params: {
      query: { tag: 'head_all' },
      levels: 3,
      center: [0, 3.6, 0.1], // B"H - Raised from 3.2 to match the longer neck
      radius: 1.15, // B"H - Shrunk from 1.3 to match the 1.8 scale
      blendMinY: 2.1,
      blendMaxY: 2.8 // Blending pushed up to accommodate the neck
    }
  }
];

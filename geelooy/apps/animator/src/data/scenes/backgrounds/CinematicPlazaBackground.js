// B"H

/**
 * @file CinematicPlazaBackground.js
 * @description
 * ============================================================================
 * CHAPTER: THE FULL PLAZA WITH NO EMPTY CAMERA REVEAL
 * ============================================================================
 */

export const CINEMATIC_PLAZA_BACKGROUND = {
  id: 'cinematic_plaza_full',
  name: 'Cinematic Plaza Full',
  sky: '#2f9cca',
  skyTop: '#1d6f98',
  ground: '#22252a',
  groundY: 128,
  road: {
    color: '#232323',
    stripe: '#b8b8b8',
    curb: '#14b86b',
    sidewalk: '#a8a8a8'
  },
  clouds: [
    { id: 'cloud_a', x: -820, y: -330, w: 260, h: 54 },
    { id: 'cloud_b', x: -430, y: -355, w: 220, h: 46 },
    { id: 'cloud_c', x: 0, y: -340, w: 280, h: 58 },
    { id: 'cloud_d', x: 430, y: -356, w: 220, h: 46 },
    { id: 'cloud_e', x: 820, y: -330, w: 260, h: 54 }
  ],
  buildings: [
    { id: 'block_01', type: 'building', x: -950, y: -96, w: 250, h: 170, color: '#174d68' },
    { id: 'block_02', type: 'building', x: -665, y: -118, w: 270, h: 205, color: '#1b5d78' },
    { id: 'block_03', type: 'building', x: -370, y: -108, w: 270, h: 188, color: '#164c67' },
    { id: 'block_04', type: 'building', x: -70, y: -126, w: 300, h: 220, color: '#1a5873' },
    { id: 'block_05', type: 'building', x: 245, y: -110, w: 270, h: 190, color: '#174d68' },
    { id: 'block_06', type: 'building', x: 545, y: -120, w: 285, h: 210, color: '#1d617c' },
    { id: 'block_07', type: 'building', x: 855, y: -102, w: 260, h: 174, color: '#164b65' }
  ],
  lamps: [
    { id: 'lamp_01', x: -780, y: -176 },
    { id: 'lamp_02', x: -390, y: -188 },
    { id: 'lamp_03', x: 0, y: -198 },
    { id: 'lamp_04', x: 390, y: -188 },
    { id: 'lamp_05', x: 780, y: -176 }
  ],
  trees: [
    { id: 'tree_01', x: -1080, y: -34, scale: 1 },
    { id: 'tree_02', x: -520, y: -34, scale: 0.9 },
    { id: 'tree_03', x: 520, y: -34, scale: 0.95 },
    { id: 'tree_04', x: 1080, y: -34, scale: 1 }
  ],
  windows: {
    color: '#ffd21c',
    rows: 4,
    columns: 5,
    w: 18,
    h: 32
  },
  props: [
    { id: 'living_box', type: 'box', x: -250, y: -82, size: 24, color: '#b87934' },
    { id: 'golden_ball', type: 'ball', x: 325, y: -92, size: 16, color: '#ffd45a' }
  ]
};
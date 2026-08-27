// B"H

/**
 * @file FaceProfiles.js
 * @description
 * ============================================================================
 * CHAPTER: THE FACES THAT STOPPED BEING CLONES
 * ============================================================================
 *
 * Five characters should not share one stamped head. These profiles vary head
 * shape, eye spacing, cheeks, jaw, brow thickness, nose length, and mouth size.
 * Every profile is still compatible with front, side, and three-quarter view.
 *
 * The Awtsmoos creates every face from nothing every instant. The image must
 * honor that each vessel has its own revealed form.
 */

export const FACE_PROFILES = {
  oval_bright: {
    id: 'oval_bright',
    head: { rx: 34, ry: 42, jaw: 0.8 },
    eyes: { spread: 15, rx: 9, ry: 7, pupil: 2.8 },
    brows: { width: 17, thickness: 4 },
    nose: { length: 14, width: 7 },
    mouth: { widthScale: 1.0, y: 23 },
    cheeks: { rx: 7, ry: 4, alpha: 0.3 }
  },

  narrow_focus: {
    id: 'narrow_focus',
    head: { rx: 31, ry: 43, jaw: 0.72 },
    eyes: { spread: 14, rx: 8, ry: 6.6, pupil: 2.6 },
    brows: { width: 16, thickness: 4.2 },
    nose: { length: 16, width: 6 },
    mouth: { widthScale: 0.9, y: 24 },
    cheeks: { rx: 6, ry: 3.5, alpha: 0.22 }
  },

  round_warm: {
    id: 'round_warm',
    head: { rx: 36, ry: 40, jaw: 0.92 },
    eyes: { spread: 16, rx: 9.3, ry: 7.4, pupil: 3 },
    brows: { width: 18, thickness: 4.3 },
    nose: { length: 13, width: 8 },
    mouth: { widthScale: 1.08, y: 22 },
    cheeks: { rx: 8, ry: 4.4, alpha: 0.36 }
  },

  sage_long: {
    id: 'sage_long',
    head: { rx: 35, ry: 44, jaw: 0.74 },
    eyes: { spread: 15, rx: 8.4, ry: 6.8, pupil: 2.7 },
    brows: { width: 18, thickness: 4.5 },
    nose: { length: 17, width: 7 },
    mouth: { widthScale: 0.94, y: 24 },
    cheeks: { rx: 6.4, ry: 3.6, alpha: 0.24 }
  }
};
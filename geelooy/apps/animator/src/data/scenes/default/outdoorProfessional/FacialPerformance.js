// B"H

const face = (id, focus) => ({
  id, focus, blinkTiming: { baseMs: 2800, jitterMs: 900, rainReflex: 0.22 },
  eyeSaccades: { micro: true, targetSwitches: ['speaker', 'tool', 'puddle', 'listener'] },
  pupilFocus: { nearTool: 0.62, farListener: 0.38, lanternCatchlight: true },
  jawTension: { worry: 0.38, resolve: 0.22 },
  cheekCompression: { smileOverlap: 0.31, rainSquint: 0.18 },
  lipCompression: { listening: 0.28, withholdingFear: 0.36 },
  asymmetricSmiles: { left: 0.16, right: 0.24, arrivesLate: true },
  eyebrowMotion: { question: 0.42, reassurance: 0.27, anticipationLift: 0.34 },
  breathingInfluence: { nostril: 0.16, shoulders: 0.2, mouthPause: 0.12 },
  anticipationFrames: ['eyes_find_target', 'jaw_sets', 'brows_prepare', 'mouth_opens']
});

/**
 * Expressions overlap like rain rings in a puddle: no emotion snaps shut.
 */
export const FACIAL_PERFORMANCE = {
  system: 'advanced_procedural_overlapping_faces',
  overlapPolicy: 'blink_saccade_breath_expression_blend',
  characters: {
    mentor: face('mentor', 'reassuring authority'),
    apprentice: face('apprentice', 'nervous discovery'),
    client: face('client', 'skeptical trust shift')
  },
  guarantees: ['blink_timing', 'eye_saccades', 'pupil_focus', 'jaw_tension',
    'cheek_compression', 'lip_compression', 'asymmetric_smiles',
    'eyebrow_motion', 'breathing_influence', 'anticipation_frames']
};


// B"H

/**
 * @file BrowEmotionRegistry.js
 * @description Emotion data for brows.
 */

export const BROW_EMOTION_REGISTRY = {
  calm: {
    left: { outerLift: 0.02, arch: 0.18 },
    right: { outerLift: 0.02, arch: 0.18 }
  },
  happy: {
    left: { innerLift: 0.05, outerLift: 0.2, arch: 0.38, yOffset: -2 },
    right: { innerLift: 0.05, outerLift: 0.2, arch: 0.38, yOffset: -2 },
    center: { pinch: -0.04, compression: -0.08 }
  },
  angry: {
    left: { innerLift: -0.28, outerLift: -0.06, tilt: -0.28, squeeze: 0.3 },
    right: { innerLift: -0.28, outerLift: -0.06, tilt: 0.28, squeeze: 0.3 },
    center: { pinch: 0.68, compression: 0.42, verticalFold: 0.5, wrinkleIntensity: 0.38 }
  },
  sad: {
    left: { innerLift: 0.33, outerLift: -0.18, tilt: 0.2, arch: 0.2 },
    right: { innerLift: 0.33, outerLift: -0.18, tilt: -0.2, arch: 0.2 },
    center: { pinch: 0.16, compression: 0.08 }
  },
  surprised: {
    left: { innerLift: 0.48, outerLift: 0.52, arch: 0.72, yOffset: -5 },
    right: { innerLift: 0.48, outerLift: 0.52, arch: 0.72, yOffset: -5 },
    center: { compression: -0.15, wrinkleIntensity: 0.36 }
  },
  confused: {
    left: { innerLift: 0.32, outerLift: 0.42, arch: 0.55, yOffset: -3 },
    right: { innerLift: -0.08, outerLift: -0.04, arch: 0.1, yOffset: 2 },
    center: { pinch: 0.25, compression: 0.16 },
    global: { asymmetry: 0.85 }
  },
  focused: {
    left: { innerLift: -0.12, outerLift: 0, squeeze: 0.18 },
    right: { innerLift: -0.12, outerLift: 0, squeeze: 0.18 },
    center: { pinch: 0.32, compression: 0.2 }
  }
};

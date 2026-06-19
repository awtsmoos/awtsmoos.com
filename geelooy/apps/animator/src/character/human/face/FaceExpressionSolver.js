
// B"H
import { FacePose } from './FacePose.js';
import { BlinkScheduler } from './BlinkScheduler.js';
import { PhonemeLiteSolver } from './PhonemeLiteSolver.js';

/**
 * @file FaceExpressionSolver.js
 * @description
 * ============================================================================
 * CHAPTER: THE EXPRESSION THAT ROSE FROM MOOD, SPEECH, AND GAZE
 * ============================================================================
 *
 * A smile without cheeks is a mask. Speech without brows is a puppet. This
 * solver blends mood, blink, gaze, and phoneme-lite speech into one living
 * face pose.
 *
 * @module FaceExpressionSolver
 */

/**
 * @class FaceExpressionSolver
 * @description
 * Computes complete face expression data.
 */
export class FaceExpressionSolver {
  /**
   * Samples a face expression.
   *
   * @param {Object} character - Character data.
   * @param {number} time - Render time.
   * @returns {Object} Face pose.
   */
  static sample(character = {}, time = 0) {
    const emotion = character.emotion || character.currentPerformance?.emotion || 'calm';
    const mood = this.mood(emotion);
    const text = character.dialogue || character.speech || '';
    const speech = character.speaking || character.currentPerformance?.speech === 'talk'
      ? PhonemeLiteSolver.sample(text, time)
      : { active: false };

    let pose = FacePose.neutral();
    pose = FacePose.blend(pose, mood, 1);
    pose = FacePose.blend(pose, {
      eyeOpen: BlinkScheduler.eyeOpen(time, character.id || 'human', character.motionProfileData?.blink || 1),
      pupilX: this.gaze(character).x + Math.sin(time * 0.0017) * 0.05,
      pupilY: this.gaze(character).y + Math.cos(time * 0.0013) * 0.04
    }, 1);

    if (speech.active) {
      pose = FacePose.blend(pose, {
        mouthOpen: speech.mouthOpen,
        mouthWide: speech.mouthWide,
        browOuter: speech.browLift,
        cheekLift: Math.max(pose.cheekLift, speech.cheekLift)
      }, 0.9);
    }

    return pose;
  }

  /**
   * Resolves mood expression profile.
   *
   * @param {string} emotion - Emotion name.
   * @returns {Object} Face channels.
   */
  static mood(emotion) {
    const map = {
      calm: { mouthSmile: 0.04, cheekLift: 0.02 },
      happy: { mouthSmile: 0.48, mouthWide: 0.12, cheekLift: 0.35, browOuter: 0.1 },
      intense: { browInner: -0.18, browPinch: 0.36, mouthOpen: 0.08 },
      surprised: { mouthOpen: 0.48, browOuter: 0.42, eyeOpen: 1.12 },
      angry: { browInner: -0.38, browPinch: 0.5, mouthFrown: 0.18 },
      sad: { browInner: 0.18, mouthFrown: 0.32, eyeOpen: 0.82 }
    };
    return map[emotion] || map.calm;
  }

  /**
   * Resolves gaze target.
   *
   * @param {Object} character - Character data.
   * @returns {Object} Gaze x/y.
   */
  static gaze(character) {
    const gaze = character.gaze || character.currentPerformance?.gaze || 'toward_camera';
    const map = {
      toward_camera: { x: 0, y: 0 },
      forward: { x: 0.18, y: 0 },
      up: { x: 0, y: -0.22 },
      down: { x: 0, y: 0.22 },
      left: { x: -0.35, y: 0 },
      right: { x: 0.35, y: 0 }
    };
    return map[gaze] || map.toward_camera;
  }
}

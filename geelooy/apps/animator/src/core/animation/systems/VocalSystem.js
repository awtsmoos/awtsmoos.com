
// B"H
import { AwtsmoosMath } from '../../../engine/core/AwtsmoosMath.js';
import { SpeechKinetics } from '../../../character/anatomy/mouth/SpeechKinetics.js';
import { SpeechActivityGate } from './vocal/SpeechActivityGate.js';
import { SpeechHeadMotion } from './vocal/SpeechHeadMotion.js';
import { SpeechBrowMotion } from './vocal/SpeechBrowMotion.js';
import { SpeechMouthMotion } from './vocal/SpeechMouthMotion.js';

/**
 * @file VocalSystem.js
 * @description
 * ============================================================================
 * CHAPTER: REAL SPEECH, REAL OPERATORS, REAL MOTION
 * ============================================================================
 *
 * This file has no escaped operators. It uses actual JavaScript syntax.
 * Speech now drives visemes, head nods, eyebrow emphasis, cheek lift,
 * lip width, mouth open, roundness, and expression overlays.
 */
export class VocalSystem {
  /**
   * Processes speech-driven motion.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Real time.
   * @param {number} directorTime - Director time.
   * @returns {void}
   */
  static process(data, time, directorTime) {
    const speechText = SpeechActivityGate.getSpeechText(data);
    const baseTilt = Number.isFinite(data.headTiltRest) ? data.headTiltRest : 0;

    if (SpeechActivityGate.isActive(data)) {
      const localTime = Number.isFinite(data.speechLocalTime) ? data.speechLocalTime : directorTime;
      const speechData = SpeechKinetics.analyze(speechText, localTime);
      const soul = data.animPersonality || {};
      const personalityScale = soul.expressionScale || 1;

      data.vocalIntensity = (speechData.intensity || 0) * personalityScale;
      data.targetViseme = speechData.viseme || 'M';

      SpeechHeadMotion.apply(data, time, localTime, speechData, baseTilt);
      SpeechBrowMotion.apply(data, speechData, speechText, localTime);
      SpeechMouthMotion.apply(data, speechData, speechText);

      return;
    }

    data.vocalIntensity = 0;
    data.targetViseme = 'M';
    SpeechHeadMotion.relax(data, baseTilt);

    const prior = data.speechFace || {};
    data.speechFace = {
      ...prior,
      localPhase: 0,
      browRhythm: 0,
      questionLift: AwtsmoosMath.lerp(prior.questionLift || 0, 0, 0.20),
      browPinch: AwtsmoosMath.lerp(prior.browPinch || 0, 0, 0.20),
      warmth: AwtsmoosMath.lerp(prior.warmth || 0, 0, 0.20),
      squintBias: AwtsmoosMath.lerp(prior.squintBias || 0, 0, 0.20),
      mouthOpen: AwtsmoosMath.lerp(prior.mouthOpen || 0, 0.04, 0.25),
      mouthWidth: AwtsmoosMath.lerp(prior.mouthWidth || 26, 26, 0.25),
      lipRound: AwtsmoosMath.lerp(prior.lipRound || 0, 0, 0.20),
      smileBias: AwtsmoosMath.lerp(prior.smileBias || 0, 0, 0.20),
      grimaceBias: AwtsmoosMath.lerp(prior.grimaceBias || 0, 0, 0.20),
      cheekLift: AwtsmoosMath.lerp(prior.cheekLift || 0, 0, 0.20)
    };
  }
}

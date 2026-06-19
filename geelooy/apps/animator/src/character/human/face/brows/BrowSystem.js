
// B"H
import { BrowPose } from './BrowPose.js';
import { BROW_EMOTION_REGISTRY } from './emotion/BrowEmotionRegistry.js';
import { BrowSpeechAnalyzer } from './speech/BrowSpeechAnalyzer.js';
import { BrowMicroTwitch } from './micro/BrowMicroTwitch.js';

/**
 * @file BrowSystem.js
 * @description Master brow solver.
 */

export class BrowSystem {
  /**
   * Samples final brow pose.
   *
   * @param {Object} character - Character data.
   * @param {number} time - Time.
   * @param {number} index - Index.
   * @returns {Object} Brow pose.
   */
  static sample(character = {}, time = 0, index = 0) {
    const perf = character.currentPerformance || {};
    const emotion = perf.emotion || character.emotion || 'calm';
    const speechText = character.dialogue || character.speech || '';
    const speech = BrowSpeechAnalyzer.analyze(speechText, time);
    let pose = BrowPose.blend(BrowPose.neutral(), BROW_EMOTION_REGISTRY[emotion] || BROW_EMOTION_REGISTRY.calm, 1);

    if (speech.active || character.speaking || perf.speech === 'talk') {
      pose = BrowPose.blend(pose, {
        left: {
          innerLift: speech.questionLift + speech.exclamationPunch * 0.4 + speech.thought,
          outerLift: speech.beat * 0.12 + speech.pauseRelax,
          tilt: speech.thought * 0.4
        },
        right: {
          innerLift: speech.questionLift + speech.exclamationPunch * 0.4 - speech.thought,
          outerLift: speech.beat * 0.1 + speech.pauseRelax,
          tilt: -speech.thought * 0.4
        },
        center: {
          pinch: speech.exclamationPunch * 0.55,
          compression: speech.exclamationPunch * 0.3
        },
        global: { asymmetry: Math.abs(speech.thought), tremble: speech.beat * 0.06 }
      }, 0.85);
    }

    return BrowPose.blend(pose, BrowMicroTwitch.sample(time, index), 1);
  }
}

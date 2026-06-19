
// B"H
import { ShoulderSway } from './limbs/ShoulderSway.js';
import { TorsoTwist } from './torso/TorsoTwist.js';
import { EyeBlinkSystem } from './face/EyeBlinkSystem.js';
import { LipSyncSystem } from './face/LipSyncSystem.js';
import { EyeDartSystem } from './face/EyeDartSystem.js';
import { MoodMatrix } from '../../../character/anatomy/face/mood/MoodMatrix.js';

/**
 * @file BioMetricSystem.js
 * @description
 * THE RHYTHM OF EXISTENCE
 *
 * The body now carries more individual life.
 * Each soul receives a tiny private phase,
 * so the cast no longer breathes in clone-lock.
 */
export class BioMetricSystem {
  /**
   * Processes biological idle motion.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Real time.
   * @param {number} delta - Delta time.
   * @returns {void}
   */
  static process(data, time, delta) {
    const bio = MoodMatrix.evaluate(data);
    const phase = this.phase(data.id);

    const breath = Math.sin((time * bio.breathFreq) + phase) * bio.breathAmp;
    data.breathScale = 1.0 + breath;

    data.idle = data.idle || { sway: 0, headBob: 0, blink: 1 };
    data.idle.sway = Math.sin((time * 0.0005) + phase) * bio.headSwayAmp;
    data.idle.headBob = Math.sin((time * 0.0015) + (phase * 1.7)) * (1.2 + ((data.joy || 0) * 0.8));

    data.idle.blink = EyeBlinkSystem.update(data.idle.blink, bio.blinkDelayBase);
    data.eyeDart = EyeDartSystem.getOffset(time + (phase * 1000), bio.eyeDartChance);

    const tremor = Math.sin((time * 0.1) + phase) * 0.04;
    data.kinematics = data.kinematics || { arms: { left: { shoulder: 0 }, right: { shoulder: 0 } } };
    data.kinematics.arms.left.shoulder = ShoulderSway.update(-8, time + (phase * 100)) + tremor;
    data.kinematics.arms.right.shoulder = ShoulderSway.update(8, time + (phase * 100)) - tremor;

    data.torsoSway = TorsoTwist.update(0, time + (phase * 100));
    data.mouthHeight = LipSyncSystem.getMouthOpen(data.isTalking, time + (phase * 50));
  }

  /**
   * Builds a deterministic phase.
   *
   * @param {string} id - Character id.
   * @returns {number} Phase offset.
   */
  static phase(id = 'soul') {
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0;
    }
    return (Math.abs(hash) % 360) * (Math.PI / 180);
  }
}

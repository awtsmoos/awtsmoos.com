
// B"H
import { BioMetricSystem } from '../../../animation/systems/BioMetricSystem.js';
import { LocomotionSystem } from '../../../animation/systems/LocomotionSystem.js';
import { VocalSystem } from '../../../animation/systems/VocalSystem.js';
import { MorphingSystem } from '../../../animation/systems/MorphingSystem.js';
import { PhysicsSystem } from '../../../animation/systems/PhysicsSystem.js';
import { FacePerformanceSystem } from '../../../animation/systems/face/FacePerformanceSystem.js';
import { ActingEngine } from '../../../../character/acting/ActingEngine.js';
import { AppearanceDiversityPass } from './AppearanceDiversityPass.js';
import { MotionVarietyPass } from '../../../animation/systems/personality/MotionVarietyPass.js';

/**
 * @file RealismEngine.js
 * @description
 * THE BREATH OF LIFE.
 *
 * This version gives each character unique motion DNA first, then applies
 * biology, locomotion, acting, speech, morphs, final face overlays, and physics.
 */
export class RealismEngine {
  /**
   * Processes one character.
   *
   * @param {Object} data - Character data.
   * @param {number} realTime - Real time.
   * @param {number} directorTime - Director time.
   * @param {Object} state - App state.
   * @returns {Object} Processed character.
   */
  static process(data, realTime, directorTime, state) {
    if (!data || !data.position) return data;

    AppearanceDiversityPass.apply(data);
    MotionVarietyPass.apply(data);

    const lastTime = data._lastDirectorTime || directorTime;
    const dtRaw = directorTime - lastTime;
    data._lastDirectorTime = directorTime;
    const safeDt = Number.isFinite(dtRaw) ? Math.max(0, Math.min(100, dtRaw)) : 16;

    const sceneData = state && state.get ? (state.get('scene') || {}) : {};
    const groundY = sceneData.groundY || 120;

    BioMetricSystem.process(data, realTime, safeDt);
    LocomotionSystem.process(data, realTime, safeDt);
    ActingEngine.apply(data, realTime);
    VocalSystem.process(data, realTime, directorTime);
    MorphingSystem.process(data, realTime, safeDt);
    FacePerformanceSystem.process(data, realTime);
    PhysicsSystem.process(data, realTime, safeDt, groundY);

    return data;
  }
}

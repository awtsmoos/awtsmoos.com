// B"H
import { ActingPose } from './ActingPose.js';
import { BreathingMotion } from './BreathingMotion.js';
import { WeightShiftMotion } from './WeightShiftMotion.js';
import { HeadMotion } from './HeadMotion.js';
import { ShoulderMotion } from './ShoulderMotion.js';
import { HandGesturePlanner } from './HandGesturePlanner.js';
export class BodyPerformanceEngine {
  static compose(input = {}) {
    const energy = Number(input.energy || 1);
    const head = HeadMotion.sample(input.time || 0, input.progress || 0, energy);
    return ActingPose.make({ breath: BreathingMotion.sample(input.time, energy), weight: WeightShiftMotion.sample(input.time), headTilt: head.tilt, headNod: head.nod, shoulder: ShoulderMotion.sample(input.progress, energy), hand: HandGesturePlanner.choose(input.gesture, input.speech) });
  }
}

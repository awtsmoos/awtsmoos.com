// B"H
import { CameraDebugFlags } from './CameraDebugFlags.js';import { ShotDecisionTrace } from './ShotDecisionTrace.js';
export class ShotPlanLogger{static log(plan){if(CameraDebugFlags.log)console.log('B"H shot plan',ShotDecisionTrace.make(plan));}}

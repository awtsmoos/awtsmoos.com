// B"H
/** Runtime queue for walk, run, stand, teach, and speak intentions. */
import { AnimationCommandQueue } from "./AnimationCommandQueue.js";
import { animationForIntent } from "./AnimationIntentMapper.js";
export class LocomotionIntentRuntime {
  constructor() { this.queue = new AnimationCommandQueue(); }
  intend(target, intent = "idle", detail = {}) { return this.queue.push(target, animationForIntent(intent), { intent, ...detail }); }
  snapshot() { return { queued:this.queue.snapshot() }; }
}
export default LocomotionIntentRuntime;

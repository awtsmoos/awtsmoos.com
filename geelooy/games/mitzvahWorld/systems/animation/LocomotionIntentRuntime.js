// B"H
/** Runtime queue for walk, run, stand, teach, and speak intentions. */
import { AnimationCommandQueue } from "./AnimationCommandQueue.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { animationForIntent } from "./AnimationIntentMapper.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export class LocomotionIntentRuntime {
  constructor() { this.queue = new AnimationCommandQueue(); }
  intend(target, intent = "idle", detail = {}) { return this.queue.push(target, animationForIntent(intent), { intent, ...detail }); }
  snapshot() { return { queued:this.queue.snapshot() }; }
}
export default LocomotionIntentRuntime;

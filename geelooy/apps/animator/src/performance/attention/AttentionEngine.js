// B"H
import { GazePlanner } from './GazePlanner.js';
import { BlinkScheduler } from './BlinkScheduler.js';
import { EyeDartPlanner } from './EyeDartPlanner.js';
export class AttentionEngine {
  static compose({ character = {}, event = {}, time = 0, emphasis = 0 } = {}) { return { target: GazePlanner.choose(character, event), blink: BlinkScheduler.sample(time, this.seed(character.id), emphasis), dart: EyeDartPlanner.sample(time, character.isTalking ? 0.45 : 1) }; }
  static seed(id = '') { return [...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % 13; }
}

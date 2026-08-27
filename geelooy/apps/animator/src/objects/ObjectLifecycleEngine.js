// B"H
import { ObjectMotionPresets } from './ObjectMotionPresets.js';
import { ObjectContactSolver } from './ObjectContactSolver.js';
export class ObjectLifecycleEngine {
  static advance(current = {}, event = {}, t = 0) {
    const motion = ObjectMotionPresets.sample(event.action || event.objectAction, event.from || current, event.to || current, t, event.height || 10);
    return ObjectContactSolver.solve({ ...current, ...motion, lifecycle: event.lifecycle || current.lifecycle || 'moving', type: event.type || event.propType || current.type, size: event.size || current.size });
  }
}

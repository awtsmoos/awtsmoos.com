/* B"H */
import { rippleDelete } from './Timeline.js';
export function createRippleEngine(input = {}) { return { kind:'RippleEngine', enabled:input.enabled ?? true }; }
export function applyRippleDelete(timeline, clipId) { return rippleDelete(timeline, clipId); }

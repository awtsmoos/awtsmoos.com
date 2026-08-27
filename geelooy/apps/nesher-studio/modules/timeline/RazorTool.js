/* B"H */
import { razorClip } from './Timeline.js';
export function createRazorTool(input = {}) { return { kind:'RazorTool', enabled:input.enabled ?? true }; }
export function applyRazor(timeline, clipId, time) { return razorClip(timeline, clipId, time); }

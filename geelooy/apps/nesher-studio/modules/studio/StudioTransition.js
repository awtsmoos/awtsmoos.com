/* B"H */
export function createStudioTransition(input = {}) { return { kind:'StudioTransition', type:input.type || 'cut', duration:Number(input.duration || 0), progress:0 }; }
export function applyTransition(transition, t) { transition.progress = Math.max(0, Math.min(1, transition.duration ? t / transition.duration : 1)); return transition; }
export function transitionComplete(transition) { return transition.progress >= 1; }

// B"H
export function universeAnimationReport(animations = {}) { return { locomotion:animations?.locomotion?.queued?.length || 0, gestures:animations?.gestures?.length || 0 }; }

// B"H
/** Animation commands emitted without knowing skeleton names yet. */
export function animationCommand(target, animation, detail = {}) { return { adapter:"animation", target, animation, detail }; }
export function animationBatch(items = []) { return items.map(i => animationCommand(i.target, i.animation, i.detail || i)); }

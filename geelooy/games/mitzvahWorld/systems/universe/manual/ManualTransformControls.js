// B"H
export const DEFAULT_TRANSFORM = Object.freeze({ position:[0,0,0], rotation:[0,0,0], scale:[1,1,1] });
export function normalizeTransform(manual = {}) { return { position:manual.position || DEFAULT_TRANSFORM.position, rotation:manual.rotation || DEFAULT_TRANSFORM.rotation, scale:manual.scale || DEFAULT_TRANSFORM.scale }; }

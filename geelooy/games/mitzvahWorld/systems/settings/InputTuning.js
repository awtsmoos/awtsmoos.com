// B"H
const DEFAULTS = Object.freeze({ sensitivity:1, deadzone:8, invertX:false, invertY:false, floating:false });
export function normalizeInputTuning(value = {}) { return { ...DEFAULTS, ...value, sensitivity:Math.max(.25, Math.min(3, Number(value.sensitivity ?? DEFAULTS.sensitivity))), deadzone:Math.max(0, Math.min(48, Number(value.deadzone ?? DEFAULTS.deadzone))), invertX:Boolean(value.invertX), invertY:Boolean(value.invertY), floating:Boolean(value.floating) }; }
export function applyAxisTuning(x, y, tuning = {}) { const t = normalizeInputTuning(tuning); return { x:x * t.sensitivity * (t.invertX ? -1 : 1), y:y * t.sensitivity * (t.invertY ? -1 : 1) }; }
export default normalizeInputTuning;

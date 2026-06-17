// B"H
function readSettings() { try { return JSON.parse(globalThis.window?.localStorage?.getItem?.("awtsmoosJoystickSettings") || "{}"); } catch { return {}; } }
function number(value, fallback, min, max) { const n = Number(value); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback; }
function settings() { const raw = readSettings(); return { sensitivity:number(raw.sensitivity, 1, .25, 3), deadzone:number(raw.deadzone, 8, 0, 48), invertX:Boolean(raw.invertX), invertY:Boolean(raw.invertY) }; }
function sign(value, invert) { return invert ? -value : value; }
export default class VirtualJoystickLogic {
  static computeVector(data, currentX, currentY) {
    const s = settings();
    const rawDx = currentX - data.centerX;
    const rawDy = currentY - data.centerY;
    const dist = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
    const deadzone = s.deadzone ?? data.deadzone ?? 8;
    if (dist < deadzone) return { x:0, y:0, magnitude:0 };
    const baseRadius = Math.max(1, Number(data.baseRadius || 50));
    const magnitude = Math.min(dist, baseRadius) / baseRadius;
    const x = sign(rawDx / dist, s.invertX) * s.sensitivity;
    const y = sign(rawDy / dist, s.invertY) * s.sensitivity;
    return { x, y, magnitude };
  }
}
export { settings as joystickSettings };

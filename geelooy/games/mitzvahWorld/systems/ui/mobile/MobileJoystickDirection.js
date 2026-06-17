// B"H
export const JOYSTICK_DIRECTION = Object.freeze({ naturalX:1, naturalY:1, invertX:-1, invertY:-1 });
export function joystickSettings(win = globalThis.window) {
  let stored = {}; try { stored = JSON.parse(win?.localStorage?.getItem?.("awtsmoosJoystickSettings") || "{}"); } catch {}
  return { invertX:Boolean(stored.invertX), invertY:Boolean(stored.invertY), scale:Number(stored.scale || 1) || 1 };
}
export function applyJoystickDirection(x, y, win = globalThis.window) {
  const s = joystickSettings(win); return { x:x * (s.invertX ? -1 : 1) * s.scale, y:y * (s.invertY ? -1 : 1) * s.scale };
}
export default applyJoystickDirection;

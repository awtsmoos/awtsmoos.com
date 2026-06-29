// B"H
export const TAU = Math.PI * 2;

export function nowMs(clock = {}) {
  return Number(clock.now?.() ?? Date.now());
}

export function vec(x = 0, z = 0, y = 0) {
  return { x:Number(x) || 0, y:Number(y) || 0, z:Number(z) || 0 };
}

export function dist(a, b) {
  return Math.hypot((a?.x || 0) - (b?.x || 0), (a?.z || 0) - (b?.z || 0));
}

export function yawTo(from, to) {
  return Math.atan2((to?.x || 0) - (from?.x || 0), (to?.z || 0) - (from?.z || 0));
}

export function face(actor, target) {
  actor.yaw = yawTo(actor.position, target.position || target);
  return actor.yaw;
}

export function facingDot(actor, target) {
  const yaw = Number(actor?.yaw || 0);
  const dir = { x:Math.sin(yaw), z:Math.cos(yaw) };
  const dx = (target?.position?.x || 0) - (actor?.position?.x || 0);
  const dz = (target?.position?.z || 0) - (actor?.position?.z || 0);
  const len = Math.hypot(dx, dz) || 1;
  return (dir.x * dx + dir.z * dz) / len;
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function deterministicOffset(index, scale = 1) {
  const a = (index * 12.9898) % TAU;
  const r = ((index * 78.233) % 1) * scale;
  return { x:Math.cos(a) * r, z:Math.sin(a) * r };
}
